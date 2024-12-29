import express from 'express';
import Controller from './controller';
const groupRouter = express.Router();
import { validateToken } from '../../middleware';

const controller = new Controller();

groupRouter.post('/', validateToken, controller.createGroup);
groupRouter.put('/:id', validateToken, controller.updateGroup);
groupRouter.post('/:id/members', validateToken, controller.addMember);

export default groupRouter;