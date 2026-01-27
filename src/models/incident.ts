import mongoose, { Schema, Document } from "mongoose";

export interface IIncident extends Document {
  monitor: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  cause: string; // e.g., "Connection Timeout", "500 Internal Server Error"
  startedAt: Date;
  resolvedAt?: Date;
  duration?: number; // In seconds
  isResolved: boolean;
}

const IncidentSchema: Schema = new Schema(
  {
    monitor: { type: mongoose.Schema.Types.ObjectId, ref: "Monitor", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cause: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    duration: { type: Number, default: 0 },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IIncident>("Incident", IncidentSchema);