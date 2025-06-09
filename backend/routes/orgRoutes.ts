import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { orgContext } from "../middleware/orgContext";
import { getOrgProperties } from "../controllers/propertyController";
import { orgStats } from "../controllers/orgController";

const router = Router();

router.use(authenticate, orgContext);

router.get("/properties", getOrgProperties);
router.get("/:orgId/stats", orgStats);

export default router;