
import mongoose, { Schema } from "mongoose";


const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: String, ref: 'User', required: true },
    members: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        joinedAt: { type: Date, default: Date.now }
    }],
    groupPicture: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


export default mongoose.model('Group', groupSchema);