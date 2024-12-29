import bcrypt from 'bcrypt';

export class Password {
    static async toHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    static async compare(hashedPassword: string, plainPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}
