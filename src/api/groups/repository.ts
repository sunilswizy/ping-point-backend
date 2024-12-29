
import { ICreateGroup, IUpdateGroup, IAddMember } from "../../types/payload";
import { IResponse } from "../../types/response";
import Group from "../../models/group";

class Repository {
    public createGroup = async (data: ICreateGroup): Promise<IResponse> => {
        try {
            const group = new Group(data);
            await group.save();
            return { statusCode: 201, body: group };
        } catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    }

    public updateGroup = async (id: string, data: IUpdateGroup): Promise<IResponse> => {
        try {
            const group = await Group.findByIdAndUpdate(id, data, { new: true });
            return { statusCode: 200, body: group };
        }
        catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    }

    public addMember = async (id: string, data: IAddMember): Promise<IResponse> => {
        try {
            const group = await Group.findById(id);
            if (!group) {
                return { statusCode: 404, body: "Group not found" };
            }

            group.members.push(data);
            await group.save();
            return { statusCode: 200, body: group };
        }
        catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    }
}

export default Repository;