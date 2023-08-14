import express from 'express';
import { Gpt } from 'chatgpt-node';
import dotenv from 'dotenv';
dotenv.config();

const router = new express.Router();

const chatUser = new Gpt({ email: process.env.GPT_EMAIL, password: process.env.GPT_PASSWORD });

router.get('/chat', async (req, res) => {
    try {
        const prompt = req.query.prompt;
        if (!prompt || prompt.length < 2) {
            return res.status(404).json({
                status: 'error',
                description: 'prompt missing'
            });
        }
        
        const authenticated = await chatUser.authenticate();

        if (!authenticated) {
            throw new Error('not authenticated with chat');
        };

        const chat = await chatUser.conversation({ message: prompt });
        res.status(200).json(JSON.parse(chat));
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            description: err.message
        });
    };
});

router.get('/chat_stream', async (req, res) => {
    try {
        const ip = req.socket.remoteAddress;
        console.log('got a request from ip:', ip);
        let prompt = req.query.prompt;
        if (!prompt || prompt.length < 2) {
            return res.status(404).json({
                status: 'error',
                description: 'prompt missing'
            });
        }
        prompt = process.env.GPT_PROMPT + ' ' + prompt;
        const authenticated = await chatUser.authenticate();
        if (!authenticated) {
            throw new Error('not authenticated with chat');
        };

        const chat = await chatUser.conversation({ message: prompt, stream: true });

        chat.on('data', (chunk) => {
            res.write("data: " + `${chunk.toString()}\n\n`)
        });

        res.setHeader("Content-Type", "text/event-stream");
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            description: err.message
        });
    };
});

export default router;