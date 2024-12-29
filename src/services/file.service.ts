import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

export class FileService {
    private s3: AWS.S3;

    constructor() {
        AWS.config.update({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });

        this.s3 = new AWS.S3();
    }

    public async getPreSignedUrl(bucket: string, key: string, type: string): Promise<string> {
        const params = {
            Bucket: bucket,
            Key: key,
            ContentType: type,
            Expires: 3600,
        };

        return this.s3.getSignedUrlPromise("putObject", params);
    }

    public async uploadFile(file: any, bucket: string): Promise<void> {
        const params = {
            Bucket: bucket,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await this.s3.upload(params).promise();
    }
}