import { Request, Response } from "express";
import { insightGetService } from "../services/insightServoce";

export const getInsight = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const insights = await insightGetService(userId);

    res.success({
      data: insights,
    });
  } catch (error : any) {
    res.internalServerError({ message: error.message });
  }
};
