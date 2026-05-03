import  jwt from 'jsonwebtoken'
import { supabase } from '../config/supabaseClient.js'

const SECRET_KEY = process.env.SECRET_KEY

const authMiddleware = async (req, res, next) =>{
    try{
        const auth_header = req.headers.authorization

        if(!auth_header || !auth_header.startsWith("Bearer ")){
            return res.status(401).json( {error: "invalid token format"})
        }
        const access_token = auth_header.split(" ")[1]

        if (!access_token){
             return res.status(401).json({error: "access token not found"})
        }

        const decoded = jwt.verify(access_token, SECRET_KEY)
        const user = await supabase 
            .from('User')
            .select('*')
            .eq('username', decoded.username)
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = user.data[0];

        next();

    }catch(err){
        return res.status(401).json({ error: "invalid or expired token" })
    }
}

export default authMiddleware