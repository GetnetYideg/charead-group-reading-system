import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

export const aiService = async(req, res) =>{
    try{    
        
        const { message } = req.body

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message
        })
        
        res.json({
            reply: response.text
        })
    }catch(error){
        console.error(error)
        
        res.status(500).json({
            error: "something went wrong"
        })
    }
}