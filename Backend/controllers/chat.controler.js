import { supabase } from "../config/supabaseClient.js";

export const sendMessage = async (req, res) => {
    try{    
        const { content } = req.body
        const sender_id = req.user.id
        const group_id = req.params.group_id

        if (!content){
            return res.status(400).json({message: "put something dingay"});
        }

        const {data, error: dberror} = await supabase
            .from("Message")
            .insert([{
                sender_id,
                group_id,
                content
            }]).select()

        console.log(dberror)
        if(dberror) throw new Error ("something happened on the database");
        res.status(200).json(data);
    }catch(error){
        res.status(500).json(error.message)
    }
}

export const getMessages = async (req, res) =>{
    try {
        const group_id = req.params.group_id
        const user_id = req.user.id

        const {data: memberData, error: err} = await supabase
            .from("Member")
            .select("*")
            .eq("group_id", group_id)
            .eq("user_id", user_id)
            .maybeSingle()
        
        if(err) throw new Error("Something happened on the database");

        if(!memberData){
            return res.status(401).json({message: "Not Authorized"})
        }

        const {data, error: dberror} = await supabase
            .from("Message")
            .select("*")
            .eq("group_id", group_id)
            .order("created_at", { ascending: true })
        
        if(dberror){
            throw new Error("something happened on the database")
        }

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }
}