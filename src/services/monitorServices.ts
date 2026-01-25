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
  return await Monitor.find({ user: userId, isDeleted: false })
    .select('-headers') // Security: Hide encrypted headers
    .sort({ createdAt: -1 });
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