import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

router.route("/user/history/blood-requests").post(UserController.getUserRequestHistory)

export default router;