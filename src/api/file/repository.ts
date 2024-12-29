
import { IPreSignedUrl } from "../../types/payload";
import { IResponse } from "../../types/response";
import { FileService } from "../../services/file.service";

class Repository {
    fileService = new FileService();
    bucketName = 'pat-v2-stage';

    public async getPreSignedUrl({ key, type }: IPreSignedUrl): Promise<IResponse> {
        const url = await this.fileService.getPreSignedUrl(this.bucketName, key, type);
        return { statusCode: 200, body: url };
    }

    public async uploadFile(file: any): Promise<IResponse> {
        const response = await this.fileService.uploadFile(file, this.bucketName);
        return { statusCode: 200, body: response };
    }

}

export default Repository;