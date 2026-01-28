import Monitor from "../models/monitor";
import Incident from "../models/incident";
import { sendEmail } from "./emailService";
import "../models/user";

export const handleMonitorStatusChange = async (
  monitorId: string,
  newStatus: "UP" | "DOWN",
  cause: string = "Unknown Error",
) => {
  const monitor = await Monitor.findById(monitorId).populate("user");
  if (!monitor) return;

  const user: any = monitor.user; // Get user for email

  // --- SCENARIO A: Monitor Went DOWN ---
  if (newStatus === "DOWN" && monitor.status === "UP") {
    console.log(`[Incident] ${monitor.friendlyName} went DOWN.`);

    // 1. Create Incident Record
    await Incident.create({
      monitor: monitor._id,
      user: user._id,
      cause: cause,
      isResolved: false,
      startedAt: new Date(),
    });

    // 2. Send Alert Email
    await sendEmail(
      user.email,
      `🚨 Alert: ${monitor.friendlyName} is DOWN`,
      `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ef4444;">System Alert</h2>
        <p>Your monitor <strong>${monitor.friendlyName}</strong> is unreachable.</p>
        <p><strong>URL:</strong> ${monitor.url}</p>
        <p><strong>Reason:</strong> ${cause}</p>
        <p style="color: #64748b; font-size: 12px;">Time: ${new Date().toLocaleString()}</p>
      </div>
      `,
    );
  }

  // --- SCENARIO B: Monitor Recovered (UP) ---
  if (newStatus === "UP" && monitor.status === "DOWN") {
    console.log(`[Incident] ${monitor.friendlyName} recovered.`);

    // 1. Find and Resolve the Open Incident
    const incident = await Incident.findOne({
      monitor: monitor._id,
      isResolved: false,
    }).sort({ createdAt: -1 });

    if (incident) {
      const now = new Date();
      const duration = Math.floor(
        (now.getTime() - incident.startedAt.getTime()) / 1000,
      ); // seconds

      incident.resolvedAt = now;
      incident.isResolved = true;
      incident.duration = duration;
      await incident.save();

      // 2. Send Recovery Email
      await sendEmail(
        user.email,
        `✅ Resolved: ${monitor.friendlyName} is UP`,
        `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #10b981;">Service Recovered</h2>
          <p><strong>${monitor.friendlyName}</strong> is back online.</p>
          <p><strong>Downtime Duration:</strong> ${Math.floor(duration / 60)}m ${duration % 60}s</p>
          <p style="color: #64748b; font-size: 12px;">Time: ${new Date().toLocaleString()}</p>
        </div>
        `,
      );
    }
  }
};

export const getIncidentservice = async (userId: string) => {
  return await Incident.find({ user: userId }).populate("monitor");
};

export const getRecentIncidentservice = async (userId: string) => {
  return await Incident.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("monitor", "friendlyName url")
      .populate("user", "name email");
};

export const getRecentIncidentOfMonitorservice = async (userId: string , monitorId : string) => {
  return await Incident.find({ user: userId, monitor: monitorId })
      .sort({ createdAt: -1 })
      .limit(5)
};

