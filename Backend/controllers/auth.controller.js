import { supabase } from '../config/supabaseClient.js'
import joi from 'joi'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config()
const userSchema = joi.object({
    first_name: joi.string().min(3).required(),
    last_name:  joi.string().min(3),
    password:   joi.string().min(8).required().max(20),
    email:      joi.string().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).required(),
    username:   joi.string().pattern(/^[a-zA-Z0-9_]{5,}$/).required()
})

const loginSchema = joi.object({
    username: joi.string().pattern(/^[a-zA-Z0-9_]{5,}$/).required(),
    password: joi.string().min(8).required().max(20)
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

export const login = async (req, res) => {
    try {
        const { error: validationError, value } = loginSchema.validate(req.body)
        const { username, password } = req.body
        const { data, error:dberror } = await supabase 
                                        .from('User')
                                        .select('*')
                                        .eq('username', username)
        if (!data) return res.status(404).json({message: "You are not registered, please register first. (ደደብ ነህ እንዴ)"});

        const passwd = data[0].password
        const isMatch = await bcrypt.compare(req.body['password'], passwd)
        if (isMatch) {
            const token = jwt.sign({username}, process.env.SECRET_KEY, { expiresIn: "2w" })
            res.status(200).json({'access_token':token})
        }
        else{
            throw new Error('Invalid credentials')
        }
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const logout = async (req, res) => {
    
}