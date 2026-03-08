require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { HfInference } = require('@huggingface/inference');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Hugging Face client
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple system prompt to give the AI context about its role
const SYSTEM_PROMPT = `You are an expert hackathon mentor and assistant. Your goal is to provide concise, helpful, and encouraging advice about hackathons. 
This includes tips on ideation, team building, tech stacks, pitching, time management, and surviving the event. Keep your answers brief and directly address the user's question without unnecessary fluff.`;

// API Endpoint for Chat
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const chatHistory = req.body.history || [];

        if (!userMessage) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Format history for the model
        // Llama-3 format generally accepts an array of message objects {role, content}
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatHistory.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text })),
            { role: "user", content: userMessage }
        ];

        // Call Hugging Face API
        const response = await hf.chatCompletion({
            model: "meta-llama/Meta-Llama-3-8B-Instruct", // A good, free, open model
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
        });

        const aiResponse = response.choices[0].message.content;

        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Error calling Hugging Face API:", error);
        res.status(500).json({
            error: 'Failed to generate response.',
            details: error.message || 'Unknown error. Check the server logs or verify your Hugging Face API token is valid.'
        });
    }
});

// Fallback to index.html for any other routes (SPA like behavior)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
