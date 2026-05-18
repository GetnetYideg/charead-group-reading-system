import { supabase } from "../config/supabaseClient.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({message:"no file provided"});
        const file = req.file
        const document = JSON.parse(req.body.document)
        const group_id = document.group_id
        const { data, error:dberror } = await supabase
                            .from('Member')
                            .select('is_admin')
                            .eq('user_id', req.user.id)
                            .eq('group_id', group_id)
                            .maybeSingle()
        
        if (dberror) throw new Error(dberror)
        if (!data || !data.is_admin) return res.status(403).json({message:"unauthorized, you cant upload files to this group"})

        const originalName = file.originalname
        const fileExtention = path.extname(originalName)
        const storedName = `${uuidv4()}-_-${originalName}`
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
                                size_bytes:file.size
                            }]).select()
        if (error) return res.status(500).json({error:error})
        return res.status(201).json({data:metaData})
    } catch (error) {
        return res.status(500).json({error:error})
    }
}

export const listFiles = async (req, res) => {

}

export const getFileMetadata = async (req, res) => {

}

export const downloadFile = async (req, res) => {

}

export const deleteFile = async (req, res) => {

}