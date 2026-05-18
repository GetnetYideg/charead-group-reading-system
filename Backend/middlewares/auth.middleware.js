import  jwt from 'jsonwebtoken'
import { supabase } from '../config/supabaseClient.js'

const SECRET_KEY = process.env.SECRET_KEY

const authMiddleware = async (req, res, next) =>{
    const token = req.cookies.token
    
    if(!token){
        return res.status(401).json({error: "unauthorized, first login to logout. 'What is light for him, as he never saw darkness'-master ougway."})
    }
    try{
        const decoded = jwt.verify(token, SECRET_KEY)
        const { data:user } = await supabase
            .from('User')
            .select('is_active')
            .eq('username', decoded.username)
            .limit(1)
        if (!user || user.is_active == false) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = decoded // attaches all the user data that is used to sign the jwt to the request

        next();

    }catch(error){
        return res.status(401).json({ 'error': error })
    }
}

export default authMiddleware