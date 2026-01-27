import express from "express";
import { protectRoutes } from "../../middlewares/authMiddleware";
import { getIncidents, getRecentIncidents, getRecentIncidentsMonitor } from "../../controllers/incidentController";

const router = express.Router();

router.get("/", protectRoutes, getIncidents);
router.get("/recent", protectRoutes, getRecentIncidents)
router.get("/recent/:id", protectRoutes, getRecentIncidentsMonitor)

export default router;
