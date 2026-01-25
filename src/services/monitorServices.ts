import mongoose from 'mongoose';
import Monitor, { IMonitor } from '../models/monitor';
import PingLog from '../models/pingLog';

// Create a new monitor in the database
export const createMonitorService = async (
  userId: string,
  data: Partial<IMonitor>
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
        isDeleted: false 
      } 
    },
    
    {
      $lookup: {
        from: 'pinglogs', // The collection name in MongoDB (usually lowercase plural)
        let: { monitorId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$monitorId', '$$monitorId'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 20 },
           { $project: { 
              // CONDITIONAL LOGIC:
              responseTime: {
                $cond: {
                  if: { $eq: ["$status", "UP"] }, // Check if status is "UP"
                  then: "$responseTime",          // If yes, keep actual latency
                  else: 0                         // If "DOWN" or "TIMEOUT", force 0
                }
              },
              _id: 0 
            }}
        ],
        as: 'recentLogs'
      }
    },

    { $sort: { createdAt: -1 } }
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
  }));
};

// Get a single monitor by ID (Owned by user)
export const getMonitorService = async (monitorId: string, userId: string) => {
  return await Monitor.findOne({ _id: monitorId, user: userId });
};

// Toggle the isActive status of a monitor
export const toggleMonitorService = async (monitorId: string, userId: string) => {
  const monitor = await Monitor.findOne({ _id: monitorId, user: userId });
  
  if (!monitor) return null;

  monitor.isActive = !monitor.isActive;
  await monitor.save();
  
  return monitor;
};

// Delete a monitor and all its associated logs
export const deleteMonitorService = async (monitorId: string, userId: string) => {
  const monitor = await Monitor.findOneAndUpdate(
    { _id: monitorId, user: userId },
    { 
      isDeleted: true,   
      isActive: false    
    },
    { new: true } 
  );

  return monitor;
};


// Update an existing monitor
export const updateMonitorService = async (
  monitorId: string,
  userId: string,
  updateData: Partial<IMonitor>
) => {
  const monitor = await Monitor.findOne({ 
    _id: monitorId, 
    user: userId,
    isDeleted: false 
  });

  if (!monitor) return null;

  Object.keys(updateData).forEach((key) => {
    (monitor as any)[key] = (updateData as any)[key];
  });

  await monitor.save();

  return monitor;
};