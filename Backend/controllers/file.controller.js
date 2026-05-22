import { supabase } from "../config/supabaseClient.js";
import path from "path";
import crypto from "crypto";

const hashFile = async (fileBuffer) => {
    return crypto
        .createHash('sha-256')
        .update(fileBuffer)
        .digest('hex')
}

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({message:"no file provided"});
        const document = JSON.parse(req.body.document)
        const group_id = document.group_id

        const { data:member, error:dberror } = await supabase
                            .from('Member')
                            .select('is_admin')
                            .eq('user_id', req.user.id)
                            .eq('group_id', group_id)
                            .maybeSingle()
        
        if (dberror) throw new Error(dberror)
        if (!member || !member.is_admin) return res.status(403).json({message:"unauthorized, you cant upload files to this group"});
        
        const file = req.file
        const originalName = file.originalname
        const fileExt = path.extname(originalName)
        const hashString = await hashFile(file.buffer)
        const storedName = `${hashString}${fileExt}`
        
        const { data:existingData, error:existingDataError } = await supabase
                            .from('File')
                            .select('group_id ,path')
                            .eq('hash', hashString)
        if (existingDataError) res.status(500).json({message:existingDataError})

        if (existingData.length > 0){
            for(let i = 0; i < existingData.length; i++){
                
                if(existingData[i].group_id == group_id){
                    return res.status(200).json({message:"same file exists"})
                }
            }
           
            const { data:metaData, error:sameFileSaveError } = await supabase
                            .from('File')
                            .insert([{
                                user_id:req.user.id,
                                group_id:group_id,
                                original_name:originalName,
                                stored_name:storedName,
                                path:existingData[0].path,
                                mime_type:file.mimetype,
                                size_bytes:file.size,
                                hash:hashString
                            }]).select()
            if (sameFileSaveError) return res.status(500).json({error:error})
            return res.status(201).json({data:metaData})
        }
        
        const filePath = `books/${storedName}`
        const { error:uploadError } = await supabase.storage
                            .from('ChaRead - avatar and books')
                            .upload(filePath,file.buffer, {
                                contentType:file.mimetype,
                                upsert:true
                            })
        if (uploadError) return res.status(500).json({"error":"upload error " + uploadError});
        
        const { data:URLData } = await supabase.storage
                            .from('ChaRead - avatar and books')
                            .getPublicUrl(filePath)
        const fileURL = URLData.publicUrl
        
        const { data:metaData, error } = await supabase
                            .from('File')
                            .insert([{
                                user_id:req.user.id,
                                group_id:group_id,
                                original_name:originalName,
                                stored_name:storedName,
                                path:fileURL,
                                mime_type:file.mimetype,
                                size_bytes:file.size,
                                hash:hashString
                            }]).select()
        if (error) return res.status(500).json({error:error})
        return res.status(201).json({data:metaData})
    } catch (error) {
        return res.status(500).json({error:error})
    }
}

export const getFileMetadata = async (req, res) => {
    try {
        const fileId = req.params.id
        
        const { data:fileData, error} = await supabase
                .from('File')
                .select('*')
                .eq('id', fileId)
        
        if(!fileData) return res.status(403).json({error:"file not found"})
        return res.status(200).json({data:fileData})
    } catch (error) {
        return res.status(500).json({error:error})
    }
    
}

export const downloadFile = async (req, res) => {
    try {
        const fileId = req.params.id
        
        const { data:fileData, error:err } = await supabase
                .from('File')
                .select('*')
                .eq('id', fileId)
                .maybeSingle()
        if(err) return res.json({error:err})
        if(!fileData) return res.status(403).json({error:"file not found"})
        
        const {data:fileBuffer, error} = await supabase.storage
                .from('ChaRead - avatar and books')
                .download(`books/${fileData.stored_name}`)
        
        if(error) return res.json({error:error})
        
        res.setHeader('Content-Type', fileBuffer.type || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.original_name)}"`);

        const stream = fileBuffer.stream()
        const reader = stream.getReader()
        
        while (true){
            const { done, value } = await reader.read()
            if (done) break;
            res.write(value)
        }
        
        res.end()
    } catch (error) {
        return res.status(500).json({error:error})
    }
}

export const deleteFile = async (req, res) => {

}