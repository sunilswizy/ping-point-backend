import { Request, Response } from 'express';
import Repository from './repository';

const repository = new Repository();

class Controller {

    public createMessage = async (req: Request, res: Response) => {
        try {
            const data = await repository.createMessage(req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error creating message: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public editMessage = async (req: Request, res: Response) => {
        try {
            const data = await repository.editMessage(req.params.id, req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error edit message: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public getMessagesByConversation = async (req: Request, res: Response) => {
        try {
            const data = await repository.getMessagesByConversation(req.params.conversationId, req.params.userId);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error getting messages by conversation: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public listConversations = async (req: Request, res: Response) => {
        try {
            const data = await repository.listConversations(req.params.userId);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error listing conversations: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public createConversation = async (req: any, res: Response) => {
        try {
            const data = await repository.createConversation(req.body, req.token.id);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error creating conversation: ", error.message);
            res.status(500).send(error.message);
        }
    }

}

export default Controller;