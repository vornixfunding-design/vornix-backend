import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import ctraderRoutes from "./ctraderRoutes.js";
import planRoutes from "./planRoutes.js";

const router = Router();

router.get("/health", getHealth);
router.use("/ctrader", ctraderRoutes);
router.use("/plans", planRoutes);

export default router;
