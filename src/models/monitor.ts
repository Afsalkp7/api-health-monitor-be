import mongoose, { Schema, Document, Model } from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto';

export interface IMonitor extends Document {
  user: mongoose.Types.ObjectId;
  friendlyName: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: { key: string; value: string }[];
  body: any;
  frequency: number;
  timeout: number;
  expectedCode: number;
  isActive: boolean;
  isDeleted: boolean;
  status: 'UP' | 'DOWN' | 'TIMEOUT' | 'PENDING';
  lastChecked: Date | null;
  nextCheck: Date;
  responseTime: number;
  createdAt: Date;
  updatedAt: Date;

  getDecryptedHeaders(): Record<string, string>;
}


const monitorSchema: Schema<IMonitor> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    friendlyName: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: 'GET',
    },
    headers: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true }, // Stored Encrypted
      },
    ],
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    frequency: {
      type: Number,
      required: true,
      default: 60,
      enum: [ 10, 20, 60, 300, 600, 1800],
    },
    timeout: {
      type: Number,
      default: 5000,
      max: 30000,
    },
    expectedCode: {
      type: Number,
      default: 200,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'TIMEOUT', 'PENDING'],
      default: 'PENDING',
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    nextCheck: {
      type: Date,
      default: Date.now,
    },
    responseTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save Hook: Auto-Encrypt Headers
monitorSchema.pre('save', function (next) {

  if (this.isModified('headers') && this.headers && this.headers.length > 0) {
    this.headers = this.headers.map((h) => ({
      key: h.key,
      value: h.value.includes(':') ? h.value : encrypt(h.value),
    }));
  }
  next();
});

// Instance Method: Get Decrypted Headers
monitorSchema.methods.getDecryptedHeaders = function () {
  const decrypted: Record<string, string> = {};
  if (this.headers) {
    this.headers.forEach((h: { key: string; value: string }) => {
      decrypted[h.key] = decrypt(h.value);
    });
  }
  return decrypted;
};

monitorSchema.index({ isActive: 1, isDeleted: 1, nextCheck: 1 });

const Monitor: Model<IMonitor> = mongoose.model<IMonitor>('Monitor', monitorSchema);
export default Monitor;