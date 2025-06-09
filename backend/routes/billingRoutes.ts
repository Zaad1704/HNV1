import { Router } from "express";
import { getPlans, getBillingHistory, subscribe } from "../controllers/billingController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/rbac";

const router = Router();

router.get("/plans", authenticate, getPlans);
router.get("/history", authenticate, getBillingHistory);
router.post("/subscribe", authenticate, authorize(["SuperAdmin", "Landlord"]), subscribe);

export default router;