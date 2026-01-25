import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/authService";

// 1. Register User
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name } = req?.body || {};
    const data = await AuthService.registerUser({ email, password, name });
    res.success({ message: "OTP sent to your email. Please verify.", data });
  } catch (error) {
    next(error);
  }
};

// 2. Verify OTP
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    const data = await AuthService.verifyUserOtp(email, otp);

    // Set the Refresh Token Cookie so the user is truly "logged in"
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.success({
      message: "Email verified successfully.",
      data: {
        user: data.user,
        accessToken: data.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Resend OTP
export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    await AuthService.resendOtp(email);
    res.success({ message: "OTP resent successfully." });
  } catch (error) {
    next(error);
  }
};

// 4. Login User
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const data = await AuthService.loginUser(email, password);

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.success({
      message: "Login successful.",
      data: { user: data.user, accessToken: data.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get New Access Token (Refresh)
export const getAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies; // Get from cookie
    if (!refreshToken) throw new Error("Refresh Token Required");

    const accessToken = await AuthService.refreshAccessToken(refreshToken);
    res.success({ data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

// 6. Forgot Password
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    await AuthService.requestPasswordReset(email);
    res.success({ message: "Password reset OTP sent to email." });
  } catch (error) {
    next(error);
  }
};

// 7. Reset Password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password } = req.body;
    await AuthService.resetPassword(email, otp, password);
    res.success({ message: "Password has been reset successfully." });
  } catch (error) {
    next(error);
  }
};

// 8. Logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("refreshToken");
    res.success({ message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
};
