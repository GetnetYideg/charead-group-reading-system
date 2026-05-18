import { supabase } from '../config/supabaseClient.js'
import joi from 'joi'
import slugify from 'slugify'

const userSchema = joi.object({
    name: joi.string().min(3).required()
})

export const createGroup = async(req, res) =>{
    try{
        const { name } = req.body
        const { error: err, value } = userSchema.validate(req.body)
        if (err) return res.status(400).json({error: "Name is not correct"})

        let slug = slugify(name, { lower: true, strict: true });
        const {data:groups, error: dberror} = await supabase
            .from("Group")
            .select("*")
            .ilike("slug",`${slug}%`)
        
        if (dberror){
            throw new Error(dberror.message)
        }
        const regexPattern = new RegExp(`^${slug}(-[0-9]+)?$`)
        const existingGroups = groups
                        .filter(g => regexPattern.test(g.slug))
                        .map(g => g.slug)
    
        if (existingGroups.length > 0){ //generate unique slug
            let counter = 0
            for(let g of existingGroups){
                counter++
            }
            slug = slug + `-${counter}`
        }

        const member_count = 1;
        const owner_id = req.user.id 

        const { data , error:groupError } = await supabase
            .from("Group")
            .insert([{
                name, 
                member_count,
                slug,
                owner_id
            }]).select();
        if (groupError) throw new Error (groupError.message)
        const groupId = data[0].id

        const { data:memberData, error:memberError } = await supabase
            .from('Member')
            .insert([{
                user_id:owner_id,
                group_id:groupId,
                is_admin:true
            }]).select()
        if (memberError) throw new Error (memberError.message)
        res.status(201).json(data)
    }catch(error){
        res.status(500).json(error.message)
    }
}

export const getUsersGroup = async (req, res) => {
    try {
        const owner_id = req.user.id
        const {data, error: dberror } = await supabase
            .from("Group")
            .select("*")
            .eq("owner_id", owner_id)

        if (dberror){
             throw new Error (dberror.message)
        }
        
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json (error.message)
    }
}

export const searchGroups = async (req, res) => {
    try {
        const slug = req.params.slug
        const {data, error: dberror} = await supabase
            .from("Group")
            .select("*")
            .ilike("slug", `%${slug}%`)
        
        if (dberror){
            throw new Error(dberror.message)
        }

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const searchGroupsById = async (req, res) => {
    try {
        const group_id = req.params.id
        const { data, error: dberror } = await supabase
            .from("Group")
            .select("*")
            .eq("id", group_id)
        
        if (dberror){
            throw new Error( dberror.message )
        }

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(data)
    }
}

export const joinGroup = async (req, res) =>{
    try {
        const user_id = req.user.id
        const group_id = req.params.id
        const is_admin = false

        const { data, error: dberror } = await supabase 
            .from("Member")
            .insert([{
                user_id,
                group_id,
                is_admin
            }]).select()
        
        if(dberror){
            throw new Error( dberror.message)
        }

        res.status(201).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const deleteGroup = async (req, res) =>{
    try {
        const user_id = req.user.id
        const group_id = req.params.id
        const { data, error: dberror } = await supabase
            .from("Group")
            .select("*")
            .eq("id", group_id)
        
        if(dberror){
            throw new Error(dberror.message)
        }

        console.log("data", data, "User_id", user_id)
        if(!data){
            return res.status(404).json({message: "Group not found"})
        }

        if(data[0].owner_id != user_id){
            return res.status(401).json({message: "Unauthorized to access"})
        }

        const { error:groupDberror } = await supabase
            .from('Group')
            .delete()
            .eq('id', group_id);

        if(groupDberror){
            throw new Error( groupDberror.message)
        }

        const { error: memberDberror } = await supabase
            .from("Member")
            .delete()
            .eq("group_id", group_id)
        
        if(memberDberror){
            throw new Error( memberDberror.message )
        }

        res.status(200).json({message: "Group deleted successfully"})

    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const listFiles = async (req, res) => {
    const slug = req.params.slug
    if (!slug) return res.status(400).json({message:"slug is required"})

    try {
        const {data:groupId} = await supabase
            .from('Group')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (!groupId) return res.status(404).json({message:'group not found'})
        
        const { data:filesData } = await supabase
            .from('File')
            .select('*')
            .eq('group_id', groupId.id)
        return res.status(200).json(filesData)
    } catch (error) {
        res.status(500).json(error.message)
    }
}