import { AppDataSource } from "../config/Database";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { UserInterface } from "../interfaces/interface";

export class UserRepository {
  /**
   * Find existing user by email or username
   */
  static async findExistingUser(email: string, username: string): Promise<User | null> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const userRepository = AppDataSource.getRepository(User);
    try {
      return await userRepository.findOne({
        where: [{ email }, { username }],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error('Error finding existing user: ' + errorMessage);
    }
  }

  /**
   * Create a user entity from request data
   */
  static createUser(data: Partial<UserInterface>): User {
    const user = new User();
    user.username = data.Username ?? '';
    user.firstName = data.FirstName ?? '';
    user.lastName = data.LastName ?? '';
    user.email = data.Email ?? '';
    user.phoneNumber = data.PhoneNumber ?? null;

    return user;
  }

  /**
   */
  static async saveUser(
    user: User,
  ): Promise<{ success: boolean; message: string; user?: User }> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    try {
      // 1. Assign default role
      const guestRole = await roleRepository.findOne({ where: { roleName: 'GUEST' } });

      if (!guestRole) {
        console.warn('"GUEST" role not found. Please seed the roles first.');
        return { success: false, message: 'System configuration error: Default role not found' };
      }

      user.roles = [guestRole];

    

      // 3. Save the user
      const savedUser = await userRepository.save(user);

      return {
        success: true,
        message: 'User saved successfully with default role "GUEST"',
        user: savedUser,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error saving user:', errorMessage);
      return { success: false, message: 'Database error: ' + errorMessage };
    }
  }



  static async getAllUsers(): Promise<Partial<User[]> | null> {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.find({
      select: ["userId", "username", "firstName", "lastName", "email","phoneNumber"],
      relations: ["roles","organizations"], // Include roles in the response
      order: { username: "DESC" }, // Sort by username

    });
  }

  static async getUserById(id: UserInterface["UserID"]): Promise<Partial<User> | null> {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.findOne({
      where: { userId: id },
      select: ["userId", "username", "firstName", "lastName", "email", "phoneNumber"],
      relations: ["roles","organizations"], // Include roles in the response
    });
  }

  static async deleteUser(id: UserInterface["UserID"]): Promise<{ success: boolean; message: string }> {
    const userRepository = AppDataSource.getRepository(User);
  
    try {
      const user = await userRepository.findOne({ where: { userId: id } });
  
      if (!user) {
        return { success: false, message: "User not found" };
      }
  
      await userRepository.remove(user);
      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, message: "Failed to delete user" };
    }
  }
}
