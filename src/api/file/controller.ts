import { Request, Response } from 'express';
import Repository from './repository';

const repository = new Repository();

class Controller {

    public preSignedUrl = async (req: Request, res: Response) => {
        try {
            const data = await repository.getPreSignedUrl(req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error Getting preSignedUrl: ", error.message);
            res.status(500).send(error.message);
        }
    }

    public uploadFile = async (req: Request, res: Response) => {
        try {
            const data = await repository.uploadFile(req.body);
            res.status(data.statusCode).send(data.body);
        } catch (error: any) {
            console.error("Error Uploading file: ", error.message);
            res.status(500).send(error.message);
        }
    };

}

export default Controller;