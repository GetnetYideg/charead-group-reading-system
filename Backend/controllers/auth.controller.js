import { supabase } from '../config/supabaseClient.js'
import joi, { string } from 'joi'
import bcrypt from 'bcrypt'

const userSchema = joi.object({
    first_name: string().min(3).required(),
    last_name:  string().min(3),
    password:   string().min(8).required().max(20),
    email:      string().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).required(),
    username:   string().pattern(/^[a-zA-Z0-9_]{5,}$/).required()
})
export const register = async (req, res) => {
    try{
        const { first_name, last_name, email, password, username} = req.body
        const { err, value } = userSchema.validate(req.body)
        if (err) throw new Error("you bitch ass nigga, fix your shit")

        const { data, error } = await supabase.from("User").insert(first_name, last_name, email, bcrypt(password), username)

        if (error) throw new Error("somthing bad happened, in the db") 
        res.status(201).json(data)
    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
}
export const login = async (req, res) => {
    
}