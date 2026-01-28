import cron from "node-cron";
import axios from "axios";
import Monitor, { IMonitor } from "../models/monitor";
import PingLog from "../models/pingLog";
import { handleMonitorStatusChange } from "../services/incidentService";

const checkMonitor = async (monitor: IMonitor) => {
  const start = Date.now();
  let status = "DOWN";
  let statusCode = 0;
  let errorMessage = "";
  let responseTime = 0;

  try {
    // Decrypt Headers (Using the method we defined in the Model)
    const headers = monitor.getDecryptedHeaders();

    const response = await axios({
      url: monitor.url,
      method: monitor.method,
      headers: headers,
      data: monitor.body,
      timeout: monitor.timeout,
      validateStatus: () => true, // Ensure we handle 404/500 manually without throwing
    });

    const end = Date.now();
    responseTime = end - start;
    statusCode = response.status;

    // determine status. UP if status matches user expectation (default 200)
    if (response.status === monitor.expectedCode) {
      status = "UP";
    } else {
      status = "DOWN";
    }
  } catch (error: any) {
    // Handle Network Errors (DNS, Timeout)
    const end = Date.now();
    responseTime = end - start;
    status = "DOWN";

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        status = "TIMEOUT";
        errorMessage = `Request timed out after ${monitor.timeout}ms`;
      } else {
        errorMessage = error.message;
      }
    } else {
      errorMessage = "Unknown Error";
    }
  }

  if (monitor.status !== status) {

    const incidentStatus = status === "UP" ? "UP" : "DOWN";
    const incidentCause = errorMessage || `Status changed to ${status}`;

    await handleMonitorStatusChange(
      monitor.id,
      incidentStatus,
      incidentCause,
    ).catch((err) => console.error(`[Worker] Incident Handler Error:`, err));
  }

  // Create Log Entry
  await PingLog.create({
    monitorId: monitor._id,
    status: status,
    responseTime: responseTime,
    statusCode: statusCode,
    errorMessage: errorMessage,
  });

  // Update Monitor State & Next Check Time
  const nextCheck = new Date(Date.now() + monitor.frequency * 1000);

  await Monitor.updateOne(
    { _id: monitor._id },
    {
      status: status,
      lastChecked: new Date(),
      responseTime: responseTime,
      nextCheck: nextCheck,
    },
  );

  console.log(
    `[Worker] Checked ${monitor.friendlyName}: ${status} (${responseTime}ms)`,
  );
};

// THE SCHEDULER
// Queries DB every minute and distributes work
export const startMonitoringWorker = () => {
  console.log("Monitoring Engine Started. Waiting for jobs...");
  // Run every 10 seconds
  cron.schedule("*/10 * * * * *", async () => {
    try {
      // Find monitors that are Active AND Due for a check AND Not Deleted
      const monitorsToCheck = await Monitor.find({
        isActive: true,
        isDeleted: false,
        nextCheck: { $lte: new Date() },
      });

      if (monitorsToCheck.length > 0) {
        console.log(
          `[Scheduler] Processing ${monitorsToCheck.length} monitors...`,
        );

        await Promise.allSettled(
          monitorsToCheck.map((monitor) => checkMonitor(monitor)),
        );
      }
    } catch (error) {
      console.error("Worker Scheduler Error:", error);
    }
  });
};
