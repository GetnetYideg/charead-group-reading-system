import { supabase } from '../config/supabaseClient.js'
import joi from 'joi'
import bcrypt from 'bcrypt'

const userSchema = joi.object({
    first_name: joi.string().min(3).required(),
    last_name:  joi.string().min(3),
    password:   joi.string().min(8).required().max(20),
    email:      joi.string().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).required(),
    username:   joi.string().pattern(/^[a-zA-Z0-9_]{5,}$/).required()
})

const hashPasword = async (password) =>{
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)

    return hash
}
export const register = async (req, res) => {
    try{
        const { first_name, last_name, email, password, username} = req.body
        const { error: err, value } = userSchema.validate(req.body)
        if (err) throw new Error("you bitch ass nigga, fix your shit")

        const { data, error } = await supabase
                                    .from("User")
                                    .insert([{
                                        first_name, 
                                        last_name, 
                                        email, 
                                        username, 
                                        password: await hashPasword(password)
                                    }]).select()

        if (error) throw new Error("somthing bad happened, in the db") 
        res.status(201).json(data)
    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
}
// export const login = async (req, res) => {
    
// }//