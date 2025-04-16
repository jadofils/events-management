// src/controller/auth/LoginController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../config/Database';
import { User } from '../../models/User';
import * as bcrypt from "bcryptjs";
import { UserController } from './Registration';
import jwt from 'jsonwebtoken';
import PasswordService from '../../services/EmailService';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

export class LoginController extends UserController {
  static async loginWithDefaultPassward(req: Request, res: Response): Promise<void> {
    if (!AppDataSource.isInitialized) {
      res.status(500).json({ success: false, message: "Database not initialized" });
      return;
    }

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: "Please enter both email/username and password.",
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    try {
      const user = await userRepository.findOne({
        where: [{ email: identifier }, { username: identifier }],
        relations: ["roles", "organizations"],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "No account found with that email or username.",
        });
        return;
      }

      // Verify session data matches
      if (!req.session?.defaultPassword || 
          !(req.session.defaultEmail === user.email || req.session.username === user.username)) {
        res.status(401).json({
          success: false,
          message: "Session data doesn't match user account.",
        });
        return;
      }

      // Password verification
      let isMatch = false;
      let isSessionPasswordLogin = false;

      if (req.session.defaultPassword === password) {
        isMatch = true;
        isSessionPasswordLogin = true;
        PasswordService.invalidateDefaultPassword(req, user.email);
      } else if (user.password) {
        isMatch = await bcrypt.compare(password, user.password);
      }

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          username: user.username,
          needsPasswordReset: isSessionPasswordLogin,
        },
        SECRET_KEY,
        { expiresIn: "24h" }
      );

      res.cookie("authToken", token, {
        httpOnly: true,
        maxAge: COOKIE_EXPIRATION,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
      });

      const { password: _, ...userData } = user;

      res.status(200).json({
        success: true,
        message: isSessionPasswordLogin 
          ? "Login successful! Please create a new password." 
          : "Login successful!",
        user: { ...userData, needsPasswordReset: isSessionPasswordLogin },
        token,
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong while logging in.",
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    // Check if credentials are provided
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide both username/email and password."
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    try {
      // Find user by email or username
      const user = await userRepository.findOne({
        where: [{ email: identifier }, { username: identifier }],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "No account found with that email or username."
        });
        return;
      }

      // Check password (either hash or default password)
      let isMatch = false;
      
      // Check if it is the default password
      if (password === '' || password===null) {
        isMatch = true;  // Default password logic
      } else if (user.password) {
        // Check hashed password
        isMatch = await bcrypt.compare(password, user.password);
      }

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again."
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          username: user.username
        },
        SECRET_KEY,
        { expiresIn: "24h" }
      );

      // Send the token as response
      res.status(200).json({
        success: true,
        user: {
          userId: user.userId,
          email: user.email,
          username: user.username,
          roles: user.roles,
          organizations: user.organizations,
        },
        message: "Login successful!",
        token
      });
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong while logging in.",
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }


}