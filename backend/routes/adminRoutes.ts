import { Router } from "express";
import {
  listOrganizations,
  setOrgStatus
} from "../controllers/orgController";
import { getAllContent, updateContent } from "../controllers/cmsController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/rbac";

const router = Router();

// SuperAdmin only
router.get("/organizations", authenticate, authorize(["SuperAdmin"]), listOrganizations);
router.post("/organizations/status", authenticate, authorize(["SuperAdmin"]), setOrgStatus);
router.get("/content", authenticate, authorize(["SuperAdmin"]), getAllContent);
router.put("/content", authenticate, authorize(["SuperAdmin"]), updateContent);

export default router;