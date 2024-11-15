import { Router } from "express";
import { AuthController } from "../controllers/authController"; // Adjust path as necessary
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.route("/user/send-otp").post(AuthController.sendOtpController);
router.route("/user/verify-otp").post(AuthController.verifyOtp);
router.route("/user/check-user").post(AuthController.checkUserExists);
router.route("/user/create-user").post(AuthController.createUser);
router.route("/user/avatar").post(AuthController.uploadAvatar);
router.route("/user/:userId/addresses/:addressId").put(authMiddleware, AuthController.editAddress).delete(authMiddleware, AuthController.deleteAddress);
router.route("/user/:userId/address").post(authMiddleware, AuthController.addAddress);
router.route("/user/users").get(authMiddleware, AuthController.getUsers);

export default router;
