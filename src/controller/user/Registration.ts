// src/controller/UserController.ts
import { Request, Response } from 'express';
import { UserRepository } from '../../repositories/UserRepository';
import { AppDataSource } from '../../config/Database';
import { User } from '../../models/User';
import PasswordService from '../../services/EmailService';
import { Organization } from '../../models/Organization';


export class UserController {

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, firstName, lastName, email, phoneNumber } = req.body;
      console.log('Registering user with data in controller:', req.body);
  
      // === Validation Checks ===
      if (!username || username.length < 3 || username.length > 50) {
        res.status(400).json({ success: false, message: 'Username must be between 3 and 50 characters' });
        return;
      }
  
      if (!firstName || firstName.length < 1 || firstName.length > 50) {
        res.status(400).json({ success: false, message: 'First name must be between 1 and 50 characters' });
        return;
      }
  
      if (!lastName || lastName.length < 1 || lastName.length > 50) {
        res.status(400).json({ success: false, message: 'Last name must be between 1 and 50 characters' });
        return;
      }
  
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ success: false, message: 'Email must be a valid email address' });
        return;
      }
  
      if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
        res.status(400).json({ success: false, message: 'Phone number must be a valid phone number' });
        return;
      }
      
  
      const existingUser = await UserRepository.findExistingUser(email, username);
      if (existingUser) {
        res.status(400).json({ success: false, message: 'User already exists' });
        return;
      }
  
      // === Create & Save User ===
      const user = UserRepository.createUser({
        Username: username,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PhoneNumber: phoneNumber,
      });
  
      const result = await UserRepository.saveUser(user);
  
      if (!result.success || !result.user) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }
  
      const savedUser = result.user;
  
      // === Send Default Password Email ===
      try {
        const emailSent = await PasswordService.sendDefaultPassword(
          email,
          savedUser.lastName,
          savedUser.firstName,
          savedUser.username,
          req
        );
  
        if (!emailSent) {
          console.warn(`Failed to send email to ${email}, but user was created successfully`);
          // Continue with registration despite email failure
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue with registration despite email failure
      }
  
      const userRoles = savedUser.roles?.map(role => ({
        id: role.roleId,
        name: role.roleName,
        description: role.description,
      })) || [];
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully. If email is configured correctly, a default password was sent.',
        user: {
          id: savedUser.userId,
          username: savedUser.username,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          phoneNumber: savedUser.phoneNumber,
          roles: userRoles,
        }
      });
    
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }


  static async getProfile(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: 'User profile retrieved' });
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserRepository.getAllUsers();
  
      if (!users || users.length === 0) {
        res.status(404).json({ success: false, message: 'No users found' });
        return;
      }
  
      const formattedUsers = users.map(user => ({
        userId: user?.userId,
        username: user?.username,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        roles: user?.roles?.map(role => ({
          roleId: role.roleId,
          roleName: role.roleName,
          description: role.description,
        })) || [],
      }));
  
      res.status(200).json({ success: true, users: formattedUsers });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserRepository.getUserById(req.params.id);
  
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
  
      const formattedUser = {
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roles: user.roles?.map(role => ({
          roleId: role.roleId,
          roleName: role.roleName,
          description: role.description,
        })) || [],
        Organizations: user.organizations?.map(org => ({
          organizationId: org.organizationId,
          organizationName: org.organizationName,
          description: org.description,
          contactEmail: org.contactEmail,
          contactPhone: org.contactPhone,
          address: org.address,
        })) || [],
      };
  
      res.status(200).json({ success: true, user: formattedUser });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ userId });
  
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
  
      const { username, firstName, lastName, email, phoneNumber } = req.body;
  
      // Update user fields if they exist in the request
      if (username) user.username = username;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;
  
      const updatedUser = await userRepository.save(user);
  
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: {
          userId: updatedUser.userId,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
        },
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  

  static async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
  
    if (!id) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }
  
    try {
      const result = await UserRepository.deleteUser(id);
  
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(404).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error in deleteUser:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}
