import { Router } from "express";
import { BloodRequestController } from "../controllers/requestController";

const router = Router();

router.route("/blood-requests").post(BloodRequestController.createBloodRequest)
router.route("/requests").post(BloodRequestController.getAllBloodRequests);
router.route("/accept/:requestId/:userId").get(BloodRequestController.acceptBloodRequest);
router.route("/donors/:requestId").get(BloodRequestController.getDonorsAccepted)

export default router;