import express from "express";
import authRoutes from './auth/index';
import monitorRoutes from './monitor/index';
const router = express.Router();

router.use('/api/auth', authRoutes)
router.use('/api/monitor', monitorRoutes)

export default router;