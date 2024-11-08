import { Router } from "express";
import { AuthController } from "../controllers/authController"; // Adjust path as necessary

const router = Router();

router.route("/user/send-otp").post(AuthController.sendOtpController);
router.route("/user/verify-otp").post(AuthController.verifyOtp);
router.route("/user/check-user").post(AuthController.checkUserExists);
router.route("/user/create-user").post(AuthController.createUser);
router.route("/user/avatar").post(AuthController.uploadAvatar);
router.route("/user/:userId/addresses/:addressId").put(AuthController.editAddress).delete(AuthController.deleteAddress);
router.route("/user/users").get(AuthController.getUsers);

export default router;
