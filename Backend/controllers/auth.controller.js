import { supabase } from '../config/supabaseClient.js'

export const register = async (req, res) => {
    try{
        const { first_name, last_name, email, password, username} = req.body
        
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        
        if (!regex.test(email)) throw new Error('Your email is horseshitv( ፋንድያ )')
        const { data, error } = await supabase.from("User").insert(first_name, last_name, email, password, username)

        if (error){
            res.status(500).json({error})
        }

        res.status(201).json(data)
    }catch(error){
        
    }
}
export const login = async (req, res) => {
    
}