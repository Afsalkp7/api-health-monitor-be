import cron from "node-cron";
import Monitor from "../models/monitor";
import PingLog from "../models/pingLog";
import Insight from "../models/insight";
import mongoose from "mongoose";

// --- TESTING CONFIGURATION ---
const CHECK_WINDOW_MINUTES = 1;      // "Current" window (Last 1 min)
const BASELINE_WINDOW_MINUTES = 10;  // "Historical" window (Last 10 mins)
const RELIABILITY_THRESHOLD = 10;    // >10% failure rate = Critical
const LATENCY_DEGRADATION_FACTOR = 1.5; // Lowered to 1.5x for easier testing

const analyzeSystem = async () => {
  console.log("[Analytics] Starting system analysis...");
  const now = new Date();
  
  // Define Time Windows
  const checkWindowStart = new Date(now.getTime() - CHECK_WINDOW_MINUTES * 60 * 1000);
  const baselineWindowStart = new Date(now.getTime() - BASELINE_WINDOW_MINUTES * 60 * 1000);

  // 1. Get all active monitors
  const monitors: any = await Monitor.find({ isActive: true, isDeleted: false });

  for (const monitor of monitors) {
    
    // --- A. RELIABILITY CHECK (Last 1 Minute) ---
    const reliabilityStats = await PingLog.aggregate([
      { 
        $match: { 
          monitorId: monitor._id, 
          createdAt: { $gte: checkWindowStart } 
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          failures: { $sum: { $cond: [{ $eq: ["$status", "UP"] }, 0, 1] } },
        },
      },
    ]);

    const relStats = reliabilityStats[0] || { total: 0, failures: 0 };
    
    // Lowered threshold to 2 checks for testing (since 1 min window is short)
    if (relStats.total >= 2) { 
      const failureRate = (relStats.failures / relStats.total) * 100;

      if (failureRate > RELIABILITY_THRESHOLD) {
        await createOrUpdateInsight(
          monitor._id as string,
          "RELIABILITY_ISSUE",
          "CRITICAL",
          `High failure rate detected: ${failureRate.toFixed(1)}% in the last minute.`,
          failureRate
        );
      } else {
        await resolveInsight(monitor._id as string, "RELIABILITY_ISSUE");
      }
    }

    // --- B. DEGRADED PERFORMANCE CHECK ---
    
    // 1. Get Current Average (Last 1 min)
    const currentLatencyStats = await PingLog.aggregate([
      { $match: { monitorId: monitor._id, status: "UP", createdAt: { $gte: checkWindowStart } } },
      { $group: { _id: null, avg: { $avg: "$responseTime" } } }
    ]);
    const currentAvg = currentLatencyStats[0]?.avg || 0;

    // 2. Get Baseline Average (Last 10 mins) -- DYNAMIC CALCULATION
    const baselineStats = await PingLog.aggregate([
      { $match: { monitorId: monitor._id, status: "UP", createdAt: { $gte: baselineWindowStart } } },
      { $group: { _id: null, avg: { $avg: "$responseTime" } } }
    ]);
    const baselineAvg = baselineStats[0]?.avg || 0;

    console.log(`[${monitor.friendlyName}] Current: ${currentAvg.toFixed(2)}ms | Baseline: ${baselineAvg.toFixed(2)}ms`);

    if (currentAvg > 0 && baselineAvg > 0) {
      if (currentAvg > baselineAvg * LATENCY_DEGRADATION_FACTOR) {
        await createOrUpdateInsight(
          monitor._id as string,
          "DEGRADED_PERFORMANCE",
          "WARNING",
          `API is slower than usual. Current: ${Math.round(currentAvg)}ms (Normal: ${Math.round(baselineAvg)}ms)`,
          currentAvg
        );
      } else {
        await resolveInsight(monitor._id as string, "DEGRADED_PERFORMANCE");
      }
    }
  }
  console.log("[Analytics] Analysis complete.");
};

// --- HELPER FUNCTIONS ---

async function createOrUpdateInsight(monitorId: string, type: string, severity: string, details: string, metric: number) {
  const existing: any = await Insight.findOne({ monitor: monitorId, type, isActive: true });

  if (existing) {
    existing.details = details;
    existing.metricValue = metric;
    existing.updatedAt = new Date();
    await existing.save();
    console.log(`[Analytics] Updated Insight: ${type}`);
  } else {
    await Insight.create({
      monitor: monitorId,
      type,
      severity,
      details,
      metricValue: metric,
      isActive: true
    });
    console.log(`[Analytics] Raised NEW Insight: ${type}`);
  }
}

async function resolveInsight(monitorId: string, type: string) {
  await Insight.updateMany(
    { monitor: monitorId, type, isActive: true },
    { isActive: false }
  );
}

// --- SCHEDULER ---
export const startAnalyticsWorker = () => {
  console.log("Analytics Worker Started (Running every 1 minute)");
  // Run every 1 minute
  cron.schedule("*/1 * * * *", () => {
    analyzeSystem();
  });
};