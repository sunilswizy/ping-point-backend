import express from 'express';
import Controller from './controller';
import { validateToken } from '../../middleware';
const messageRouter = express.Router();

const controller = new Controller();

// messageRouter.post('/', validateToken, controller.createMessage);
messageRouter.put('/:id', validateToken, controller.editMessage);
messageRouter.post('/conversation/start', validateToken, controller.createConversation);
messageRouter.get('/conversation/:conversationId/:userId', validateToken, controller.getMessagesByConversation);
// messageRouter.put('/conversation/:conversationId', validateToken, controller.markMessagesAsRead);
messageRouter.get('/conversations/:userId', validateToken, controller.listConversations);


export default messageRouter;