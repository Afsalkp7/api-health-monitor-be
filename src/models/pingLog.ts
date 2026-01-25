import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPingLog extends Document {
  monitorId: mongoose.Types.ObjectId;
  status: 'UP' | 'DOWN' | 'TIMEOUT';
  responseTime: number;
  statusCode: number;
  errorMessage?: string;
  createdAt: Date;
}

const pingLogSchema: Schema<IPingLog> = new Schema(
  {
    monitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitor',
      required: true,
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'TIMEOUT'],
      required: true,
    },
    responseTime: {
      type: Number, // Latency in ms
      required: true,
    },
    statusCode: {
      type: Number, // HTTP Status (200, 404, 500)
      required: true,
    },
    errorMessage: {
      type: String, // Only present if the request failed locally (DNS, Network)
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Auto-delete logs older than 30 days to keep DB fast and small
      expires: 60 * 60 * 24 * 30, 
    },
  }
);

// Compound Index: Optimizes fetching charts for a specific monitor
// "Get me logs for Monitor X, sorted by newest first"
pingLogSchema.index({ monitorId: 1, createdAt: -1 });

const PingLog: Model<IPingLog> = mongoose.model<IPingLog>('PingLog', pingLogSchema);
export default PingLog;