import express from "express";
import { protectRoutes } from "../../middlewares/authMiddleware";
import { getInsight } from "../../controllers/insightController";


const router = express.Router();


router.get("/", protectRoutes, getInsight);


export default router;
