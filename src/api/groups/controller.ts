import { Request, Response } from 'express';
import Repository from './repository';

const repository = new Repository();

class Controller {

    public createGroup = async (req: Request, res: Response) => {
        try {
            const data = await repository.createGroup(req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error creating group: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public updateGroup = async (req: Request, res: Response) => {
        try {
            const data = await repository.updateGroup(req.params.id, req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error updating group: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public addMember = async (req: Request, res: Response) => {
        try {
            const data = await repository.addMember(req.params.id, req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error adding member to group: ", error.message);
            res.status(500).send(error.message);
        }
    }

}

export default Controller;