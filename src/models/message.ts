import mongoose, { Schema } from "mongoose"

const messageSchema = new mongoose.Schema({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    content: { type: String },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text'
    },
    mediaUrl: { type: String, default: null },
    isRead: { type: Boolean, default: false }, // For direct messages
    readBy: [{ // For group messages
        userId: { type: String, ref: 'User' },
        readAt: { type: Date }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);