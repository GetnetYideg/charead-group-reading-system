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

        const slug = slugify(name, { lower: true, strict: true });
        const member_count = 1;

        const owner_id = req.user.id 

        const { data, error: dberror } = await supabase
            .from("Group")
            .insert([{
                name, 
                member_count,
                slug,
                owner_id
            }]).select()
        if (dberror) throw new Error (dberror.message)
        
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
            .eq("slug", slug)
        
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

}

export const deleteGroup = async (req, res) =>{

}