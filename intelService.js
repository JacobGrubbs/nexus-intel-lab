require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeIP = async (ip) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                { 
                  role: "system", 
                  content: "You are a cyber security expert. Analyze the IP provided and give a 1-sentence threat assessment. Focus on whether it looks like a VPN, Proxy, or Malicious actor." 
                },
                { role: "user", content: `Analyze this IP: ${ip}` }
            ],
        });

        return {
            analysis: response.choices[0].message.content,
            confidence: 0.90,
            risk: ip.startsWith('1') ? 0.8 : 0.1 // Keeping a basic score for now
        };
    } catch (error) {
        console.error("AI Error:", error);
        return { analysis: "AI Analysis currently unavailable.", confidence: 0, risk: 0 };
    }
};

module.exports = { analyzeIP };