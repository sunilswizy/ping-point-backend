import mongoose, { Schema } from 'mongoose';


const conversationSchema = new mongoose.Schema({
    conversationID: { type: String, required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        content: String,
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        messageType: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
        timestamp: { type: Date, default: Date.now }
    },
    unreadCount: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


export default mongoose.model('Conversation', conversationSchema);