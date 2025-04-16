import { AppDataSource } from '../config/Database';
import { Organization } from '../models/Organization';
import { OrganizationInterface } from '../interfaces/interface';//all dto's
import { User } from '../models/User';
import { OrganizationUser } from '../models/OrganizationUser';
import { Role } from '../models/Role';

export class OrganizationRepository {
  // Get all organizations
  static async getAll(): Promise<{ success: boolean; data?: Organization[]; message?: string }> {
    try {
      const organizations = await AppDataSource.getRepository(Organization).find();
      return { success: true, data: organizations };
    } catch (error) {
      return { success: false, message: 'Failed to fetch organizations' };
    }
  }

  // Get an organization by ID
  static async getById(id: string): Promise<{ success: boolean; data?: Organization; message?: string }> {
    if (!id) {
      return { success: false, message: 'Organization ID is required' };
    }

    try {
      const organization = await AppDataSource.getRepository(Organization).findOne({ where: { organizationId: id } });
      if (!organization) {
        return { success: false, message: 'Organization not found' };
      }
      return { success: true, data: organization };
    } catch (error) {
      return { success: false, message: 'Failed to fetch organization' };
    }
  }

  // Create a new organization
  static create(data: Partial<OrganizationInterface>): { success: boolean; data?: Organization; message?: string } {
    if (!data.OrganizationName || !data.ContactEmail || !data.Address || !data.OrganizationType) {
      return { success: false, message: 'Required fields are missing' };
    }

    const organization = new Organization();
    organization.organizationName = data.OrganizationName;
    organization.description = data.Description ?? '';
    organization.contactEmail = data.ContactEmail;
    organization.contactPhone = data.ContactPhone ?? '';
    organization.address = data.Address;
    organization.organizationType = data.OrganizationType;

    return { success: true, data: organization };
  }

  // Save an organization
  static async save(org: Organization): Promise<{ success: boolean; data?: Organization; message?: string }> {
    if (!org.organizationName || !org.contactEmail || !org.address || !org.organizationType) {
      return { success: false, message: 'Required fields are missing' };
    }
    
    try {
      // Check if the organization already exists by name or email
      const existingOrganization = await AppDataSource.getRepository(Organization).findOne({
        where: [
          { organizationName: org.organizationName },
          { contactEmail: org.contactEmail },
        ],
      });
    
      if (existingOrganization) {
        return {
          success: false,
          message: 'Organization with this name or email already exists.You can Join it!!!',
          data: existingOrganization, 
        };
        
      }
    
      // Save the new organization
      const savedOrganization = await AppDataSource.getRepository(Organization).save(org);
      return { success: true, data: savedOrganization };
    
    } catch (error) {
      console.error('Error saving organization:', error); 
      return { success: false, message: 'Failed to save organization' };
    }
    
      }
       
      
    
  // Update an organization
  static async update(
    id: string,
    data: Partial<OrganizationInterface>
  ): Promise<{ success: boolean; data?: Organization; message?: string }> {
    if (!id) {
      return { success: false, message: 'Organization ID is required' };
    }

    try {
      const repo = AppDataSource.getRepository(Organization);
      const organization = await repo.findOne({ where: { organizationId: id } });

      if (!organization) {
        return { success: false, message: 'Organization not found' };
      }

      repo.merge(organization, {
        organizationName: data.OrganizationName ?? organization.organizationName,
        description: data.Description ?? organization.description,
        contactEmail: data.ContactEmail ?? organization.contactEmail,
        contactPhone: data.ContactPhone ?? organization.contactPhone,
        address: data.Address ?? organization.address,
        organizationType: data.OrganizationType ?? organization.organizationType,
      });

      const updatedOrganization = await repo.save(organization);
      return { success: true, data: updatedOrganization };
    } catch (error) {
      return { success: false, message: 'Failed to update organization' };
    }
  }

  // Delete an organization
  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    if (!id) {
      return { success: false, message: 'Organization ID is required' };
    }

    try {
      const result = await AppDataSource.getRepository(Organization).delete(id);
      if (result.affected === 0) {
        return { success: false, message: 'Organization not found or already deleted' };
      }
      return { success: true, message: 'Organization deleted successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to delete organization' };
    }
  }

  static async addUserToOrganization(userId: string, organizationId: string): Promise<{ success: boolean; message: string; organization?: Organization; user?: User }> {
    const userRepository = AppDataSource.getRepository(User);
    const organizationRepository = AppDataSource.getRepository(Organization);
    const organizationUserRepository = AppDataSource.getRepository(OrganizationUser);
    const roleRepository = AppDataSource.getRepository(Role); // Added role repository to fetch user roles

    try {
        // Fetch the user and the organization by their IDs
        const user = await userRepository.findOne({
            where: { userId },
            relations: ['roles'] // Fetch roles associated with the user
        });

        const organization = await organizationRepository.findOne({
            where: { organizationId },
            relations: ['users'] // Fetch users related to the organization
        });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!organization) {
            return { success: false, message: 'Organization not found' };
        }

        // Check if the user is already part of the organization by querying the OrganizationUser table
        const existingMembership = await organizationUserRepository.findOne({
            where: { userId, organizationId }
        });

        if (existingMembership) {
            return { success: false, message: 'User is already a member of this organization' };
        }

        // Create new OrganizationUser entry
        const organizationUser = new OrganizationUser();
        organizationUser.userId = userId;
        organizationUser.organizationId = organizationId;

        // Save the new entry
        await organizationUserRepository.save(organizationUser);

        // Now returning the organization, user, and their roles
        return {
            success: true,
            message: 'User added to organization successfully',
            organization,
            user: {
              userId: user.userId,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              roles: user.roles // Include the roles of the user
              ,
              phoneNumber: user.phoneNumber,
              organizations: []
            }
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error adding user to organization:', errorMessage);
        return { success: false, message: 'Failed to add user to organization' };
    }
}


}