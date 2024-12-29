import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
    token?: any;
}

function decodeToken(token: string) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
        return null;
    }
}

function validateToken(
    request: CustomRequest,
    response: Response,
    next: NextFunction
): void {
    const errorObject = { success: false, message: "Authorization Failed!" };

    const token = request.headers["authorization"];
    if (!token) {
        response.status(401).send(errorObject);
        return;
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken || typeof decodedToken === "string") {
        response.status(401).send(errorObject);
        return;
    }

    request.token = decodedToken;
    next();
}

export default validateToken;
