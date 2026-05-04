import  jwt from 'jsonwebtoken'
import { supabase } from '../config/supabaseClient.js'

const SECRET_KEY = process.env.SECRET_KEY

const authMiddleware = async (req, res, next) =>{
    const token = req.cookies.token
    
    if(!token){
        return res.status(401).json({error: "unauthorized, first login to logout. 'What is light for him, as he never saw darkness'-master ougway."})
    }
    
    // if(!auth_header || !auth_header.startsWith("Bearer ")){
    //     return res.status(401).json( {error: "invalid token format"})
    // }
    // const access_token = auth_header.split(" ")[1]

    // if (!access_token){
    //      return res.status(401).json({error: "access token not found"})
    // }
    try{
        const decoded = jwt.verify(token, SECRET_KEY)
        const user = await supabase
            .from('User')
            .select('is_active')
            .eq('username', decoded.username)
            .limit(1)
        if (!user || !user.data[0].is_active) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = decoded // attaches all the user data that is used to sign the jwt to the request

        next();

    }catch(error){
        return res.status(401).json({ 'error': error })
    }
}

export default authMiddleware