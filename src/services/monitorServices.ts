import mongoose from "mongoose";
import Monitor, { IMonitor } from "../models/monitor";
import PingLog from "../models/pingLog";

// Create a new monitor in the database
export const createMonitorService = async (
  userId: string,
  data: Partial<IMonitor>,
) => {
  const monitor = await Monitor.create({
    ...data,
    user: userId,
    nextCheck: new Date(),
  });
  return monitor;
};

// Get all monitors for a specific user
export const getMonitorsService = async (userId: string) => {
  const monitors = await Monitor.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      },
    },

    {
      $lookup: {
        from: "pinglogs", // The collection name in MongoDB (usually lowercase plural)
        let: { monitorId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$monitorId", "$$monitorId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 20 },
          {
            $project: {
              // CONDITIONAL LOGIC:
              responseTime: {
                $cond: {
                  if: { $eq: ["$status", "UP"] }, // Check if status is "UP"
                  then: "$responseTime", // If yes, keep actual latency
                  else: 0, // If "DOWN" or "TIMEOUT", force 0
                },
              },
              _id: 0,
            },
          },
        ],
        as: "recentLogs",
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  // Transform Data to match Frontend Interface exactly
  return monitors.map((m) => ({
    id: m._id,
    name: m.friendlyName,
    status: m.status,
    method: m.method,
    url: m.url,
    currentLatency: m.responseTime || 0,
    uptime7d: m.recentLogs.map((l: any) => l.responseTime).reverse(),
    lastChecked: m.lastChecked,
    isActive: m.isActive,
  }));
};

// Get a single monitor by ID (Owned by user)
export const getMonitorService = async (monitorId: string, userId: string) => {
  const monitor = await Monitor.findOne({ _id: monitorId, user: userId });

  if (!monitor) return null;

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = await PingLog.aggregate([
    { $match: { monitorId: monitor._id } },
    {
      $facet: {
        // 1. Last 24 Hours Data (Uptime, Latency, Status Array)
        last24h: [
          { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              upCount: { $sum: { $cond: [{ $eq: ["$status", "UP"] }, 1, 0] } },
              avgLatency: { $avg: "$responseTime" },
              // Create array of statuses ['UP', 'DOWN', 'UP'...]
              statusArray: { $push: "$status" },
            },
          },
        ],
        // 2. Last 30 Days Data (Success Rate)
        last30d: [
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              upCount: { $sum: { $cond: [{ $eq: ["$status", "UP"] }, 1, 0] } },
            },
          },
        ],
        // 3. Last Ping (Current Latency, Last Checked)
        lastPing: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
      },
    },
  ]);

  // C. parse Aggregation Results
  const stats24h = stats[0].last24h[0] || {
    total: 0,
    upCount: 0,
    avgLatency: 0,
    statusArray: [],
  };
  const stats30d = stats[0].last30d[0] || { total: 0, upCount: 0 };
  const lastPing = stats[0].lastPing[0] || null;

  // Calculations
  const uptime24h =
    stats24h.total > 0 ? (stats24h.upCount / stats24h.total) * 100 : 0;
  const successRate30d =
    stats30d.total > 0 ? (stats30d.upCount / stats30d.total) * 100 : 0;

  // D. Construct Final Response
  const responseData = {
    id: monitor._id,
    friendlyName: monitor.friendlyName,
    url: monitor.url,
    method: monitor.method,
    isActive: monitor.isActive,
    frequency: monitor.frequency,
    timeout: monitor.timeout,
    createdAt: monitor.createdAt, // Created date

    // Calculated Stats
    uptime: Number(uptime24h.toFixed(2)), // 24h Uptime %
    status: stats24h.statusArray, // ['UP', 'DOWN', ...]
    averageLatency: Math.round(stats24h.avgLatency || 0),
    currentLatency: lastPing ? lastPing.responseTime : 0,
    successRate: Number(successRate30d.toFixed(2)), // 30d Success Rate %
    lastChecked: lastPing ? lastPing.createdAt : null,
  };

  return responseData;
};

// Toggle the isActive status of a monitor
export const toggleMonitorService = async (
  monitorId: string,
  userId: string,
) => {
  const monitor = await Monitor.findOne({ _id: monitorId, user: userId });

  if (!monitor) return null;

  monitor.isActive = !monitor.isActive;
  await monitor.save();

  return monitor;
};

// Delete a monitor and all its associated logs
export const deleteMonitorService = async (
  monitorId: string,
  userId: string,
) => {
  const monitor = await Monitor.findOneAndUpdate(
    { _id: monitorId, user: userId },
    {
      isDeleted: true,
      isActive: false,
    },
    { new: true },
  );

  return monitor;
};

// Update an existing monitor
export const updateMonitorService = async (
  monitorId: string,
  userId: string,
  updateData: Partial<IMonitor>,
) => {
  const monitor = await Monitor.findOne({
    _id: monitorId,
    user: userId,
    isDeleted: false,
  });

  if (!monitor) return null;

  Object.keys(updateData).forEach((key) => {
    (monitor as any)[key] = (updateData as any)[key];
  });

  await monitor.save();

  return monitor;
};

export const monitorGraphDataService = async (monitorId: string) => {
  const logs = await PingLog.find({ monitorId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("responseTime createdAt status");

  return logs;
};

export const getRecentPingsData = async (monitorId : string) => {
    return await PingLog.find({ monitorId })
      .sort({ createdAt: -1 })
      .limit(5);
}


export const getDashboardData = async () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Get GLOBAL Monitor Counts
    const [totalMonitors, activeMonitors] = await Promise.all([
      Monitor.countDocuments({ isDeleted: false }), // Removed user filter
      Monitor.countDocuments({ isActive: true, isDeleted: false }), // Removed user filter
    ]);

    // 2. Aggregate GLOBAL Stats (Across All Users)
    const statsAggregation = await PingLog.aggregate([
      { 
        $match: { 
          // REMOVED: user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: twentyFourHoursAgo } 
        } 
      },
      {
        $group: {
          _id: null,
          totalPings: { $sum: 1 },
          upPings: { $sum: { $cond: [{ $eq: ["$status", "UP"] }, 1, 0] } },
          totalLatency: { $sum: "$responseTime" }
        }
      }
    ]);

    const stats = statsAggregation[0] || { totalPings: 0, upPings: 0, totalLatency: 0 };

    const globalUptime = stats.totalPings > 0 
      ? (stats.upPings / stats.totalPings) * 100 
      : 0;

    const avgLatency = stats.upPings > 0 
      ? stats.totalLatency / stats.upPings 
      : 0;

      return {
        globalUptime: Number(globalUptime.toFixed(2)),
        avgLatency: Math.round(avgLatency),
        totalMonitors,
        activeMonitors
      }
}