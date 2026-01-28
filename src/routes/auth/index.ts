// src/routes/authRoutes.ts
import { Router } from "express";
import * as authController from "../../controllers/authController";
import {
  loginSchema,
  otpResendSchema,
  otpVerifySchema,
  registerSchema,
  resetPasswordSchema,
} from "../../validations/authValidation";
import { validate } from "../../middlewares/validate";
import { protectRoutes } from "../../middlewares/authMiddleware";
const router = Router();

// --- Authentication Flow ---
router.post("/register", validate(registerSchema), authController.register);
router.post("/verify-otp", validate(otpVerifySchema), authController.verifyOtp);
router.post("/resend-otp", validate(otpResendSchema), authController.sendOtp);
router.post("/login", validate(loginSchema), authController.loginUser);
router.post("/logout", authController.logout);

// --- Token Management ---
router.post("/refresh-token", authController.getAccessToken);

// --- Password Management ---
router.post(
  "/forgot-password",
  validate(otpResendSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// --- User Profile Management ---
router.patch("/profile", protectRoutes, authController.updateProfile);
router.patch("/password", protectRoutes, authController.changePassword);

export default router;
