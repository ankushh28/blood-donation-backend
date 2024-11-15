import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.route("/user/history/blood-requests").post(authMiddleware, UserController.getUserRequestHistory)
router.route("/user/:userId").get(authMiddleware, UserController.getUserById)

export default router;