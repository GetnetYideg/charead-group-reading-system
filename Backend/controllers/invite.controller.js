import { supabase } from "../config/supabaseClient.js";
import { joinGroup } from "./group.controller.js";
import joi from 'joi'

const inviteSchema = joi.object({
    to_user_id: joi.number().required(),
    group_id : joi.number().required()
})

export const sendInvitation = async (req, res) => {
    try {
        const from_user_id = req.user_id;

        const { error: err, value } = inviteSchema.validate(req.body)
        if (err) return res.status(400).json({error: "Invalid credentials"})

        const { to_user_id, group_id } = req.body;

        const {data, error: dberror} = await supabase
            .from("Invitation")
            .insert([{
                to_user_id,
                from_user_id,
                group_id
            }]).select()
        
        if(dberror){
            throw new Error("something happend in the database")
        }

        res.status(200).json(data[0])
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const getInvitations = async (req, res) =>{
    try {
        const user_id = req.user_id

        const {data, error: dberror} = await supabase
            .from("Invitation")
            .select("*")
            .eq("to_user_id", user_id)
        
        if (dberror){
            throw new Error("Something is happend on the database")
        }

        res.status(200).json(data)

    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const acceptInvitations = async (req, res) =>{
    try {
        const user_id = req.user_id
        const group_id = req.params.group_id

        await joinGroup(req, res);

        const { data, error: dberror } = supabase
            .from("Invitation")
            .delete()
            .eq("to_user_id", user_id)
            .eq("group_id", group_id)
        
        if  (dberror){
            throw new Error("Something is happend on the database")
        }

        res.status(200).json({message: "You joined the group"})
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const declineInvitation = async (req, res) => {
    try {
        const user_id = req.user_id
        const group_id = req.params.group_id

        const {data, error: dberror} = await supabase 
            .from("Invitation")
            .delete()
            .eq("to_user_id", user_id)
            .eq("group_id", group_id)
        
         if  (dberror){
            throw new Error("Something is happend on the database")
        }

        res.status(200).json({message: "You declined the invitation"})
    } catch (error) {
        res.status(500).json(error.message)
    }
}