// src/services/AuthService.ts
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { sendEmail } from '../utils/emailSender'; // We will create this later
import AppError from "../utils/appError"; // Custom Error Class we made earlier

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

// Helper: Generate OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// 1. Register Logic
export const registerUser = async (userData: any) => {
  const { email, password, name } = userData;

  const existingUser = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError("Email already registered", 422);
    }

    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.otp = otp;
    existingUser.otpExpires = otpExpires;

    await existingUser.save();

    console.log(`[DEV MODE] New OTP for pending user ${email}: ${otp}`);

    return { id: existingUser._id, email: existingUser.email };
  }

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    otp,
    otpExpires,
    isVerified: false,
  });

  console.log(`[DEV MODE] OTP for ${email}: ${otp}`);

  return { id: newUser._id, email: newUser.email };
};

// 2. Verify OTP Logic
export const verifyUserOtp = async (email: string, otp: string) => {
  const user = await User.findOne({ email }).select("+otp +otpExpires");
  if (!user) throw new AppError("User not found", 404);

  if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
    throw new AppError("Invalid or Expired OTP", 400);
  }

  // Activate User
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS, // <--- ADDED THIS
  };
};

// 3. Login Logic
export const loginUser = async (email: string, pass: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);
  if (!user.isVerified) throw new AppError("Account not verified", 401);

  const isMatch = await bcrypt.compare(pass, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  // Generate Tokens
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS, // <--- ADDED THIS
  };
};

// 4. Refresh Token Logic
export const refreshAccessToken = async (token: string) => {
  try {
    // 1. Verify the old Refresh Token
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    
    // 2. Check if user still exists (Security Check)
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("User belonging to this token no longer exists", 401);

    // 3. Issue NEW Access Token
    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // 4. Issue NEW Refresh Token (Rotation - Optional but recommended)
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // Send new refresh token
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS // Send expiry seconds
    };

  } catch (error) {
    throw new AppError("Invalid or Expired Refresh Token", 401);
  }
};

// 5. Forgot Password
export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email }).select("+otp +otpExpires");
  if (!user) throw new AppError("User not found", 404);

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await user.save();

  // TODO: await sendEmail(email, 'Reset Password', `Your Reset OTP is ${otp}`);
  console.log(`[DEV MODE] Reset OTP for ${email}: ${otp}`);
};

// 6. Reset Password
export const resetPassword = async (
  email: string,
  otp: string,
  password: string,
) => {
  const user = await User.findOne({ email }).select("+otp +otpExpires");
  if (!user) throw new AppError("User not found", 404);

  if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
    throw new AppError("Invalid or Expired OTP", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
};

// 7. Resend OTP
export const resendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await user.save();

  // TODO: await sendEmail(...)
  console.log(`[DEV MODE] New OTP for ${email}: ${otp}`);
};
