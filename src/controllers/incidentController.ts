import { Request, Response } from "express";
import { getIncidentservice, getRecentIncidentOfMonitorservice, getRecentIncidentservice } from "../services/incidentService";

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const monitors = await getIncidentservice(userId);

    res.success({
      data: monitors,
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const getRecentIncidents = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const incidents = await getRecentIncidentservice(userId);
    res.success({
      data: incidents,
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};

export const getRecentIncidentsMonitor = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const monitorId: any = req.params.id;

    const incidents = await getRecentIncidentOfMonitorservice(userId, monitorId);
    res.success({
      data: incidents,
    });
  } catch (error: any) {
    res.internalServerError({ message: error.message });
  }
};
