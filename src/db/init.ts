import mongoose from 'mongoose';
const mongoUri = process.env.MONGO_URI!;

async function connectDB() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Successfully connected to MongoDB.');

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

export default connectDB;