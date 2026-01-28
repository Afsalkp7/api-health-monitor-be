// // src/config/db.ts
// import mongoose from 'mongoose';

// const connectDB = async (): Promise<void> => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI as string);
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error('❌ Database Connection Failed:', error);
//     process.exit(1); // Stop server if DB fails
//   }
// };

// export default connectDB;



import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
    // 1. If we are already connected, return the existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // 2. If no connection exists, start a new one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log("Initializing new connection..."); 

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log("Connected to MongoDB successfully!");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("DB Connection failed:", e);
        throw e;
    }

    return cached.conn;
}

export default connectDB;