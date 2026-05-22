// import { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "../config/supabaseClient.js"

export const isMemberMiddleware = async (req, res, next) => {
    try{
        const group_id = req.params.group_id
        const user_id = req.user.id
        const { data:memberData } = await supabase
                .from('Member')
                .select('id')
                .eq('group_id', group_id)
                .eq('user_id', user_id)
                .maybeSingle()
        if(!memberData) return res.status(401).json({message:"unauthorized"});
        next()
    }catch(error){
        res.status(500).json({error:error})
    }
}

export const isAdminMiddleware = async (req, res, next) => {
    try{
        const group_id = req.params.group_id
        const user_id = req.user.id
        const { data:memberData } = await supabase
                .from('Member')
                .select('is_admin')
                .eq('group_id', group_id)
                .eq('user_id', user_id)
                .maybeSingle()
        if(!memberData || !memberData.is_admin) return res.status(401).json({message:"unauthorized"});
        next()
    }catch(error){
        res.status(500).json({error:error})
    }
}