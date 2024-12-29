import express, { NextFunction, Response, Request } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import http from 'http';
import socketHandler from './ws/ws';
import connectDB from './db/init';
import userRouter from './api/users/routes';
import messageRouter from './api/messages/routes';
import groupRouter from './api/groups/routes';
import fileRouter from './api/file/routes';
import { notFoundHandler } from './middleware';

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const allowedOrigins: string[] = ["http://localhost:5173"];

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (typeof origin === 'string' && allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
};

function handleCorsError(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err) {
        res.status(403).json({ success: false, error: err.message });
    } else {
        next();
    }
}

app.use(cors(corsOptions));
app.use(handleCorsError);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.get('/', (_req, res) => {
    res.send('Hello world, This is the root cause!');
});

app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/groups', groupRouter);
app.use('/api/file', fileRouter);

socketHandler(io);
connectDB();

app.use(notFoundHandler);
server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});

const unexpectedErrorHandler = (error: Error) => {
    console.error(error);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);