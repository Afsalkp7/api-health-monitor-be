import { Request, Response } from "express";
import {
  createMonitorService,
  getMonitorsService,
  getMonitorService,
  toggleMonitorService,
  deleteMonitorService,
  updateMonitorService,
  monitorGraphDataService,
  getRecentPingsData,
} from "../services/monitorServices";

export const createMonitor = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const monitor = await createMonitorService(userId, req.body);

    res.success({
      message: "Monitor created successfully.",
      data: monitor,
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const getMonitors = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const monitors = await getMonitorsService(userId);

    res.success({
      data: monitors,
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const getMonitor = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const monitorId: any = req.params.id;
    const monitor = await getMonitorService(monitorId, userId);

    if (!monitor) {
      return res.notFound({ message: "Monitor not found" });
    }

    res.success({
      data: monitor,
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const getMonitorGraphData = async (req: Request, res: Response ) => {
  try {
    const monitorId : any = req.params.id;
    const logs : any = await monitorGraphDataService(monitorId)
    // Reverse to show oldest -> newest on graph
    res.status(200).json({
      status: true,
      data: logs.reverse()
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const toggleMonitor = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const monitorId: any = req.params.id;
    const monitor = await toggleMonitorService(monitorId, userId);

    if (!monitor) {
      return res.notFound({ message: "Monitor not found" });
    }

    res.success({
      message: `Monitor ${monitor.isActive ? "resumed" : "paused"}.`,
      data: { isActive: monitor.isActive },
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const deleteMonitor = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const monitorId: any = req.params.id;
    const monitor = await deleteMonitorService(monitorId, userId);

    if (!monitor) {
      return res.notFound({ message: "Monitor not found" });
    }

    res.success({
      message: "Monitor and associated logs deleted successfully.",
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const updateMonitor = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id || {};
    const monitorId: any = req.params.id || {};
    const monitor = await updateMonitorService(monitorId, userId, req.body);

    if (!monitor) {
      return res.notFound({ message: "Monitor not found" });
    }

    res.success({
      message: "Monitor updated successfully.",
      data: monitor,
    });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
};


export const getRecentPings = async (req: Request, res: Response ) => {
  try {
    const monitorId: any = req.params.id;
    
    const logs = await getRecentPingsData(monitorId)
    res.success({
      data: logs
    });
  } catch (error : any) {
    res.status(500).json({ status: false, message: error.message });
  }
};