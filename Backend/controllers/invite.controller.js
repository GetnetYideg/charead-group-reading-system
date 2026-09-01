import { supabase } from "../config/supabaseClient.js";
import { joinGroup } from "./group.controller.js";
import joi from 'joi'

const inviteSchema = joi.object({
    to_user_id: joi.number().required(),
    group_id : joi.number().required()
})

export const sendInvitation = async (req, res) => {
    try {
        const from_user_id = req.user.id;

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
        const user_id = req.user.id

        const {data, error: dberror} = await supabase
            .from("Invitation")
            .select("id, to_user_id, from_user_id!inner(first_name, last_name, username), group_id!inner(id,slug)")
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
        const user_id = req.user.id
        const group_id = req.params.group_id
        const is_admin = false

        // await joinGroup(req, res);
        const { data:groupData, error:groupErr } = await supabase
        .from('Group')
        .select('*')
        .eq('id', group_id)
        .maybeSingle()
        
        if(!groupData || groupErr) throw new Error(groupErr?.message || "Group not Found")
        
        const { data:memberData, error: memberError } = await supabase 
            .from("Member")
            .insert([{
                user_id,
                group_id,
                is_admin
            }]).select()
        
        if(memberError){
            throw new Error( memberError.message)
        }

        const { data: groupUpdate } = await supabase
            .from("Group")
            .select("member_count")
            .eq("id", group_id)
            .single()
            
        if (groupUpdate) {
            await supabase.from("Group").update({ member_count: (groupUpdate.member_count || 1) + 1 }).eq("id", group_id)
        }
        
        const { data, error: dberror } = await supabase
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
        const user_id = req.user.id
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