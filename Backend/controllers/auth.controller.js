import { supabase } from '../config/supabaseClient.js'
import joi from 'joi'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import axios from 'axios';

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
            const token = jwt.sign(data[0], process.env.SECRET_KEY, { expiresIn: "1d" }) // signs the jwt using all user data
            return res.status(200).cookie('token', token, {
                httpOnly: true,
                secure:process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24
            }).json({'status':'success'})
        }
        else{
            throw new Error('Invalid credentials')
        }
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const githubOauth = async (req, res) => {
    const githubURL = `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&scope=user:email`
    
    res.redirect(githubURL)
}

export const githubOauthCallback = async (req, res) => {
    const {code} = req.query
    const postUrl = 'https://github.com/login/oauth/access_token'
    try {
        const tokenResponse = await axios.post(postUrl, {
            client_id:process.env.GITHUB_CLIENT_ID,
            client_secret:process.env.GITHUB_CLIENT_SECRET,
            code
        },
        {
            headers: {
            Accept: "application/json",
            },
        })

        const access_token = tokenResponse.data.access_token

        const githubUser = await axios.get('https://api.github.com/user',{
            headers : {
                Authorization : `bearer ${access_token}`
            }
        })

        const user = {
            first_name:githubUser.data.name,
            username:githubUser.data.login,
            oauth_provider:'github',
            oauth_provider_id:githubUser.data.id,
            avatar_url:githubUser.data.avatar_url
        }
        console.log(githubUser)
        const { data, error } = await supabase
                                    .from("User")
                                    .insert([user]).select()
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const googleOauth = async (req, res) => {

}

export const logout = async (req, res) => {
    // console.log(jwt.verify(req.cookies.token, process.env.SECRET_KEY))
    res.status(200).clearCookie('token', {
        httpOnly: true,
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path : '/'
    }).json({'status':'logged out'})
}