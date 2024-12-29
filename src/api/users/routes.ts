import express from 'express';
import Controller from './controller';
import { validateToken } from '../../middleware';
const userRouter = express.Router();


const controller = new Controller();

userRouter.post('/login', controller.login);
userRouter.post('/signup', controller.signup);
userRouter.get('/all', validateToken, controller.getUsers);
userRouter.put('/:id', validateToken, controller.updateUser);


export default userRouter;