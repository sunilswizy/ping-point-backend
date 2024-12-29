import { Server, Socket } from "socket.io";
import { ONLINE_STATUS, NEW_MESSAGE } from "../types/socket.types";
import MessageRepository from "../api/messages/repository";

const socketHandler = (io: Server) => {
    const messageRepo = new MessageRepository();
    const onlineUsers = new Map();

    console.log('Socket handler initialized');
    io.on('connection', (socket: Socket) => {

        socket.on(ONLINE_STATUS, async (data) => {
            console.log('Online status received:', data);
            const { username, status } = data;

            if (status === 'online') {
                onlineUsers.set(username, socket.id);
            } else {
                onlineUsers.delete(username);
            }

            await messageRepo.updateUserStatus(username, status);
            socket.broadcast.emit(ONLINE_STATUS, data);
        });

        socket.on(NEW_MESSAGE, async (msg) => {
            console.log('Message received:', msg);
            const response = await messageRepo.createMessage(msg);

            if (msg.receiverUsername) {
                const recipientSocket = onlineUsers.get(msg.receiverUsername);
                const senderSocket = onlineUsers.get(msg.senderUsername);
                if (recipientSocket) io.to(recipientSocket).emit(NEW_MESSAGE, response.body);
                if (senderSocket) io.to(senderSocket).emit(NEW_MESSAGE, response.body);
            } else {
                socket.broadcast.emit(NEW_MESSAGE, msg);
            }
        });

        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            for (const [username, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    await messageRepo.updateUserStatus(username, 'offline');
                    onlineUsers.delete(username);
                    socket.broadcast.emit(ONLINE_STATUS, {
                        username,
                        status: 'offline'
                    });
                    break;
                }
            }
        });
    });
}

export default socketHandler;