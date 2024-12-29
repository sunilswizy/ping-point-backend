import { Request, Response } from 'express';
import Repository from './repository';

const repository = new Repository();

class Controller {

    public login = async (req: Request, res: Response) => {
        try {
            const data = await repository.login(req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error logging in: ", error.message);
            res.status(500).send(error.message);
        }
    };

    public signup = async (req: Request, res: Response) => {
        try {
            const data = await repository.signup(req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error creating user: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public updateUser = async (req: Request, res: Response) => {
        try {
            const data = await repository.updateUser(req.params.id, req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error updating user: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public getUsers = async (req: any, res: Response) => {
        try {
            const data = await repository.getUsers(req.token.id);
            res.status(200).send(data);
        } catch (error: any) {
            console.error("Error getting users: ", error.message);
            res.status(500).send(error.message);
        }
    }

}

export default Controller;