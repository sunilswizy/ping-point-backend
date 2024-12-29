
import { ICreateUser, IUpdateUser } from "../../types/payload";
import User from "../../models/user";
import { IResponse } from "../../types/response";
import { Password } from "../../services/password.service";
import jwt from 'jsonwebtoken';

class Repository {

    public async login({ username, password }: ICreateUser): Promise<IResponse> {
        const user = await User.findOne({}).where('username').equals(username);
        if (!user) {
            return { statusCode: 404, body: { message: 'User not found' } };
        }

        const validPassword = await Password.compare(user.password, password);
        if (!validPassword) {
            return { statusCode: 400, body: { message: 'Invalid password' } };
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        const userDetails = {
            username: user.username,
            id: user._id,
            profilePicture: user.profilePicture
        };

        return { statusCode: 200, body: { token, userDetails } };
    }


    public async signup({ username, password }: ICreateUser): Promise<IResponse> {
        const userExists = await User.find({ username });
        if (userExists.length > 0) {
            return { statusCode: 409, body: { message: 'Username already exists' } };
        };

        const hashed = await Password.toHash(password);

        const user = new User({
            username,
            password: hashed,
            profilePicture: 'https://storage.googleapis.com/pat-public/assets/Male.jpg'
        });

        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        const userDetails = {
            username: user.username,
            id: user._id,
            profilePicture: user.profilePicture
        };

        return { statusCode: 201, body: { token, userDetails } };
    }

    public async updateUser(id: string, data: IUpdateUser): Promise<IResponse> {
        const user = await User.findById(id);
        if (!user) {
            return { statusCode: 404, body: { message: 'User not found' } };
        }

        await User.findByIdAndUpdate(id, data);
        return { statusCode: 200, body: { message: 'User updated' } };
    }

    public async getUsers(user_id: string) {
        const users = await User.find({
            _id: { $ne: user_id }
        }, {
            _id: 1,
            username: 1,
            profilePicture: 1,
            isOnline: 1,
            lastSeen: 1
        });
        return { statusCode: 200, body: users };
    }
}

export default Repository;