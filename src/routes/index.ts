import express from "express";
import authRoutes from "./auth/index";
import monitorRoutes from "./monitor/index";
import incidentRouter from "./incidents/index";
import insightRouter from "./insight/index"

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/monitor", monitorRoutes);
router.use("/api/incidents", incidentRouter);
router.use("/api/insights", insightRouter)

export default router;
