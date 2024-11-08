import { Router } from "express";
import { BloodRequestController } from "../controllers/requestController";

const router = Router();

router.route("/blood-requests").post(BloodRequestController.createBloodRequest).get(BloodRequestController.getAllBloodRequests);

export default router;