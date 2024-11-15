import { Router } from "express";
import { BloodRequestController } from "../controllers/requestController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.route("/blood-requests").post(authMiddleware, BloodRequestController.createBloodRequest)
router.route("/requests").post(authMiddleware, BloodRequestController.getAllBloodRequests);
router.route("/accept/:requestId/:userId").get(authMiddleware, BloodRequestController.acceptBloodRequest);
router.route("/donors/:requestId").get(authMiddleware, BloodRequestController.getDonorsAccepted)

export default router;