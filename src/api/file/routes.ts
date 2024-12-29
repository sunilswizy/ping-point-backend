import express from 'express';
import Controller from './controller';
import { validateToken } from '../../middleware';
const fileRouter = express.Router();

const controller = new Controller();

fileRouter.post('/pre-signed-url', validateToken, controller.preSignedUrl);
fileRouter.post('/upload', validateToken, controller.uploadFile);


export default fileRouter;