import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

router.route("/user/history/blood-requests").post(UserController.getUserRequestHistory)
router.route("/user/:userId").get(UserController.getUserById)

export default router;