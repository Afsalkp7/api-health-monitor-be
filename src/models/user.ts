import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the TypeScript Interface (The Shape of the Data)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  otp?: string;           // Optional because it's cleared after verification
  otpExpires?: Date;      // Optional
  createdAt: Date;
}

// 2. Define the Mongoose Schema (The Database Rules)
const UserSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide your name'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Please provide your email'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 
      'Please provide a valid email address'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  otp: { 
    type: String,
    select: false
  },
  otpExpires: { 
    type: Date,
    select: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 3. Export the Model
export default mongoose.model<IUser>('User', UserSchema);