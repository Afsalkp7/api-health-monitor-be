import mongoose, { Schema, Document } from "mongoose";

export interface IInsight extends Document {
  monitor: mongoose.Types.ObjectId;
  type: "DEGRADED_PERFORMANCE" | "RELIABILITY_ISSUE";
  severity: "WARNING" | "CRITICAL";
  details: string; // e.g., "Avg latency 1500ms (Normal: 200ms)"
  metricValue: number; // e.g., 1500 (ms) or 25 (%)
  isActive: boolean; // True until resolved
  createdAt: Date;
}

const InsightSchema: Schema = new Schema(
  {
    monitor: { type: mongoose.Schema.Types.ObjectId, ref: "Monitor", required: true },
    type: { type: String, enum: ["DEGRADED_PERFORMANCE", "RELIABILITY_ISSUE"], required: true },
    severity: { type: String, enum: ["WARNING", "CRITICAL"], required: true },
    details: { type: String, required: true },
    metricValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date},
    updatedAt: { type: Date}
  },
  { timestamps: true }
);

export default mongoose.model<IInsight>("Insight", InsightSchema);