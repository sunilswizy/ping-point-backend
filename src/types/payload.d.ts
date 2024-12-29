
interface ICreateUser {
    username: string;
    password: string;
}

interface IUpdateUser {
    profilePicture: string;
}

interface ICreateGroup {
    name: string;
    description: string;
    creator: string;
    members: string[];
    groupPicture: string;
}

interface IUpdateGroup {
    name: string;
    description: string;
    groupPicture: string;
}

interface IAddMember {
    userId: string;
    role: string;
}

interface ICreateMessage {
    senderId: string;
    recipientId?: string;
    groupId?: string;
    content: string;
    messageType: "text" | "image" | "video";
    mediaUrl?: string;
}

interface IUpdateMessage {
    content?: string;
}

interface IPreSignedUrl {
    key: string;
    type: string;
}

interface ICreateConversation {
    chatType: string;
    groupName: string;
    selectedUsers: string | string[],
    message: string,
    groupProfile: string
}

export { ICreateUser, IUpdateUser, ICreateGroup, IUpdateGroup, IAddMember, ICreateMessage, IUpdateMessage, IPreSignedUrl, ICreateConversation };