import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

export const protectRoutes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // We attach the user to the request object so controllers can access req.user
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
         return res.status(401).json({ status: false, message: 'User not found' });
      }

      req.user = user as any;

      if (!req.user) {
        // If token is valid but user was deleted from DB
        return res.unAuthorized({ status: false, message: "User not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.unAuthorized({
        status: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.unAuthorized({
      status: false,
      message: "Not authorized, no token",
    });
  }
};
