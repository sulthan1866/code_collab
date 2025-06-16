import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.CLIENT_LINK },
});
let db = new Map<string, string>();
io.on('connection', (socket) => {
    //console.log('User connected:', socket.id);

    socket.on('join-session', (sessionId: string) => {
        socket.join(sessionId);
        //console.log(`🔗 Socket ${socket.id} joined session ${sessionId}`);

        socket.to(sessionId).emit('message', `👤 ${socket.id} joined the session`);

        if (db.has(sessionId)) {
            const latestCode = db.get(sessionId);
            socket.emit('receive-code', {
                sender: 'server',
                code: latestCode,
            });
        }
    });

    socket.on('send-code', ({ sessionId, code }) => {
        if (!code || code === '' && db.has(sessionId)) {
            code = db.get(sessionId)
        }
        db.set(sessionId, code)
        // socket.to(sessionId).emit('message', `Message in ${sessionId}: ${code}`);
        socket.to(sessionId).emit('receive-code', {
            sender: socket.id,
            code,
        });

    });

    socket.on('language', ({ sessionId, language }) => {
        socket.to(sessionId).emit('language', { language });
    })

    // socket.on("auto-complete",({sessionId,autoComplete})=>{
    //   socket.to(sessionId).emit('auto-complete',autoComplete);
    //})

    socket.on('disconnect', () => {
        socket.emit('message', `Socket disconnected: ${socket.id}`);
    });
});

const PORT = process.env.SERVER_LINK;
server.listen(PORT, () => { })
