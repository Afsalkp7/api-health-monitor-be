import express from "express";
import { protectRoutes } from "../../middlewares/authMiddleware";
import { validate } from "../../middlewares/validate";
import { monitorSchema, monitorUpdateSchema } from "../../validations/monitorValidation";
import { createMonitor, deleteMonitor, getMonitor, getMonitorGraphData, getMonitors, getRecentPings, toggleMonitor, updateMonitor } from "../../controllers/monitorController";

const router = express.Router();

router.post("/", protectRoutes, validate(monitorSchema), createMonitor);
router.get("/", protectRoutes, getMonitors);
router.get("/:id", protectRoutes, getMonitor);
router.put("/:id", protectRoutes, validate(monitorUpdateSchema), updateMonitor);
router.delete("/:id", protectRoutes, deleteMonitor);
router.patch('/:id/toggle', protectRoutes, toggleMonitor);
router.get("/:id/graph", protectRoutes, getMonitorGraphData)
router.get("/:id/pings", protectRoutes, getRecentPings)

export default router;
