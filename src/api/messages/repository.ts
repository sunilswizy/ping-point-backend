import { ICreateConversation, ICreateMessage, IUpdateMessage } from "../../types/payload";
import { IResponse } from "../../types/response";
import Message from "../../models/message";
import Conversation from "../../models/conversation";
import User from "../../models/user";
import Group from "../../models/group";

class MessageRepository {

    public createMessage = async (data: ICreateMessage): Promise<IResponse> => {
        try {
            const message = new Message(data);
            await message.save();

            const { senderId, recipientId, groupId, content, messageType } = data;
            const conversationId = recipientId || groupId;

            const existingConversation: any = await Conversation.findOne({ conversationID: conversationId }).lean();

            let unreadCountUpdate = {};

            if (existingConversation) {
                unreadCountUpdate = existingConversation.participants.reduce((acc: any, participantId: string) => {
                    if (participantId.toString() !== senderId.toString()) {
                        acc[`unreadCount.${participantId}`] = 1;
                    }
                    return acc;
                }, {});
            } else if (recipientId) {
                unreadCountUpdate = { [`unreadCount.${recipientId}`]: 1 };
            }

            const conversation: any = await Conversation.findOneAndUpdate(
                { conversationID: conversationId },
                {
                    $set: {
                        "lastMessage.content": content,
                        "lastMessage.senderId": senderId,
                        "lastMessage.messageType": messageType,
                        "lastMessage.timestamp": new Date(),
                    },
                    $inc: unreadCountUpdate,
                },
                { new: true, upsert: true }
            ).populate("participants", "username profilePicture isOnline lastSeen").lean();

            if (!conversation) {
                return { statusCode: 404, body: "Conversation not found or failed to update." };
            }

            const chatData = {
                _id: message._id.toString(),
                content: message.content,
                messageType: message.messageType,
                recipientId: recipientId?.toString(),
                groupId: groupId?.toString(),
                senderId: senderId.toString(),
                senderName: conversation.participants.find((p: any) => p._id.toString() === senderId)?.username,
                timestamp: message.createdAt.toISOString(),
                chatImage: conversation.participants.find((p: any) => p._id.toString() === senderId)?.profilePicture,
                mediaUrl: message.mediaUrl,
            };

            return { statusCode: 201, body: chatData };
        } catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    };


    public editMessage = async (id: string, data: IUpdateMessage): Promise<IResponse> => {
        try {
            const message = await Message.findByIdAndUpdate(id, data, { new: true });
            if (!message) {
                return { statusCode: 404, body: "Message not found" };
            }
            return { statusCode: 200, body: message };
        } catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    }

    public getMessagesByConversation = async (conversationId: string, userId: string): Promise<IResponse> => {
        try {
            // Fetch the conversation and populate participants
            const conversation: any = await Conversation.findOne({ conversationID: conversationId })
                .populate({
                    path: "participants",
                    select: "username profilePicture isOnline lastSeen",
                })
                .populate({
                    path: "groupId",
                    select: "name groupPicture",
                })
                .lean();

            if (!conversation) {
                return { statusCode: 404, body: "Conversation not found" };
            }

            // mark messages as read
            await this.markMessagesAsRead(conversationId, userId);

            const isGroupChat = conversation.groupId ? true : false;

            // Determine chat type, name, and image
            let chatType = isGroupChat ? "group" : "private";
            let chatName = "";
            let chatImage = "";
            let isOnline = false;
            let lastSeen = null;

            if (isGroupChat) {
                chatName = conversation.groupId.name;
                chatImage = conversation.groupId.groupPicture;
            } else {
                const otherParticipant = conversation.participants.find(
                    (participant: any) => participant._id.toString() !== userId
                );
                chatName = otherParticipant.username || "Unknown";
                chatImage = otherParticipant.profilePicture;
                isOnline = otherParticipant.isOnline || false;
                lastSeen = otherParticipant.lastSeen || null;
            }

            const whereCondition = isGroupChat ? { groupId: conversationId, recipientId: null } : { $or: [{ recipientId: conversationId }, { senderId: conversationId }], groupId: null };

            const messages = await Message.find(whereCondition)
                .populate({
                    path: "senderId",
                    select: "username profilePicture",
                })
                .lean();

            // Transform messages into desired format
            const transformedMessages = messages.map((message: any) => ({
                _id: message._id,
                content: message.content,
                messageType: message.messageType,
                senderId: message.senderId._id,
                senderName: message.senderId.username,
                timestamp: message.createdAt,
                chatImage: message.senderId.profilePicture,
                mediaUrl: message.mediaUrl,
            }));

            // Prepare the response
            const chatData = {
                _id: conversation._id,
                chatType,
                chatName,
                chatImage,
                members: conversation.participants.map((participant: any) => participant._id.toString()),
                messages: transformedMessages,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
                lastSeen,
                isOnline,
            };

            return { statusCode: 200, body: chatData };
        } catch (error: any) {
            console.error("Error getting messages by conversation: ", error.message);
            return { statusCode: 500, body: error.message };
        }
    };


    public markMessagesAsRead = async (conversationId: string, user_id: string): Promise<IResponse> => {
        try {

            await Promise.all([
                Message.updateMany(
                    { $or: [{ recipientId: conversationId }, { groupId: conversationId }], isRead: false },
                    { $set: { isRead: true } }
                ),
                Conversation.updateOne(
                    { conversationID: conversationId, participants: user_id },
                    { $set: { [`unreadCount.${user_id}`]: 0 } }
                )
            ]);

            return { statusCode: 200, body: true };
        } catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    };

    public listConversations = async (userId: string): Promise<IResponse> => {
        try {
            const conversations = await Conversation.find({ participants: userId })
                .populate({
                    path: "participants",
                    select: "username profilePicture isOnline",
                })
                .populate({
                    path: "groupId",
                    select: "name groupPicture",
                })
                .lean();

            const enhancedConversations: any[] = []

            await Promise.all(
                conversations.map(async (conversation: any) => {
                    if (conversation._id.toString() === userId) return;

                    const isGroupChat = conversation.groupId ? true : false;

                    let chatType = isGroupChat ? "group" : "private";
                    let chatName = "";
                    let chatImage = "";
                    let isOnline = false;

                    if (isGroupChat) {
                        chatName = conversation.groupId.name;
                        chatImage = conversation.groupId.groupPicture;
                    } else {
                        const otherParticipant = conversation.participants.find(
                            (participant: any) => participant._id.toString() !== userId
                        );
                        chatName = otherParticipant?.username || "Unknown";
                        chatImage = otherParticipant?.profilePicture;
                        isOnline = otherParticipant?.isOnline || false;
                    }

                    const lastMessage = conversation.lastMessage || {};
                    const sender = await User.findById(lastMessage.senderId, "username").lean();
                    const senderName = sender?.username || "Unknown";

                    enhancedConversations.push({
                        _id: conversation._id,
                        chatType,
                        chatName,
                        chatImage,
                        lastMessage: {
                            content: lastMessage.content || "",
                            messageType: lastMessage.messageType || "text",
                            senderId: lastMessage.senderId || "",
                            senderName,
                            timestamp: lastMessage.timestamp || "",
                        },
                        unreadCount: conversation.unreadCount,
                        updatedAt: conversation.updatedAt,
                        isOnline,
                        conversationID: conversation.conversationID,
                    });
                })
            );

            enhancedConversations.sort((a, b) => {
                const aTime = new Date(a.lastMessage.timestamp).getTime();
                const bTime = new Date(b.lastMessage.timestamp).getTime();
                return bTime - aTime;
            });


            return { statusCode: 200, body: enhancedConversations };
        } catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    }

    public createConversation = async (data: ICreateConversation, user_id: string): Promise<IResponse> => {
        const { chatType, groupName, selectedUsers, message, groupProfile } = data;

        if (chatType === "private") {
            const existingConversation = await Conversation.findOne({
                conversationID: selectedUsers,
                participants: { $in: user_id, $size: 2 },
            })

            if (existingConversation) {
                await this.createMessage({
                    senderId: user_id,
                    recipientId: selectedUsers as string,
                    content: message,
                    messageType: "text",
                })
                return { statusCode: 200, body: existingConversation };
            }

            const conversation = new Conversation({
                conversationID: selectedUsers,
                participants: [selectedUsers, user_id],
                lastMessage: {
                    content: message,
                    senderId: user_id,
                    messageType: "text",
                    timestamp: new Date(),
                },
                unreadCount: {
                    [selectedUsers as string]: 1,
                },
            });

            const messageData = new Message({
                senderId: user_id,
                recipientId: selectedUsers,
                content: message,
                messageType: "text",
            });

            await Promise.all([conversation.save(), messageData.save()]);

            return { statusCode: 201, body: conversation };
        }
        else {

            const members = (selectedUsers as string[]).map((userId: string) => {
                return {
                    userId,
                    role: "member",
                    joinedAt: new Date(),
                }
            });

            members.push({
                userId: user_id,
                role: "admin",
                joinedAt: new Date(),
            });

            const group = new Group({
                name: groupName,
                description: "",
                creator: user_id,
                members,
                groupPicture: groupProfile,
            });

            await group.save();

            const conversation = new Conversation({
                conversationID: group._id,
                groupId: group._id,
                participants: [user_id, ...selectedUsers],
                lastMessage: {
                    content: message,
                    senderId: user_id,
                    messageType: "text",
                    timestamp: new Date(),
                },
                unreadCount: (selectedUsers as []).reduce((acc: any, curr: any) => {
                    acc[curr] = 1;
                    return acc;
                }, {})
            });

            const messageData = new Message({
                senderId: user_id,
                groupId: group._id,
                content: message,
                messageType: "text",
            });

            await Promise.all([conversation.save(), messageData.save()]);

            return { statusCode: 201, body: conversation };
        }
    };

    public async updateUserStatus(username: string, status: string): Promise<IResponse> {
        try {
            await User.findOneAndUpdate({ username }, { isOnline: status === "online", lastSeen: new Date() }, { new: true });
            return { statusCode: 200, body: true };
        }
        catch (error: any) {
            return { statusCode: 500, body: error.message };
        }
    }

}

export default MessageRepository;
