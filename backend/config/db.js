import mongoose from "mongoose";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing. Add it to backend/.env before starting the server.");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};

export default connectDB;
