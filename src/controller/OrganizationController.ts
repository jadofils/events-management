import { Request, Response } from 'express';
import { OrganizationRepository } from '../repositories/OrganizationRepository';

export class OrganizationController {
  // Get all organizations
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await OrganizationRepository.getAll();
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        res.status(500).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch organizations', error: err.message });
    }
  }

  // Get an organization by ID
  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
       res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    try {
      const result = await OrganizationRepository.getById(id);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        res.status(404).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch organization', error: err.message });
    }
  }

  // Create a new organization
  static async create(req: Request, res: Response): Promise<void> {
    const { OrganizationName, Description, ContactEmail, ContactPhone, Address, OrganizationType } = req.body;

    if (!OrganizationName || !ContactEmail || !Address || !OrganizationType) {
       res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    try {
      const createResult = OrganizationRepository.create({
        OrganizationName,
        Description,
        ContactEmail,
        ContactPhone,
        Address,
        OrganizationType,
      });

      if (!createResult.success) {
         res.status(400).json({ success: false, message: createResult.message });
      }

      const saveResult = await OrganizationRepository.save(createResult.data!);
      if (saveResult.success) {
        res.status(201).json({ success: true, message: 'Organization created successfully', data: saveResult.data });
      } else {
        res.status(400).json({ success: false, message: saveResult.message });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create organization', error: err.message });
    }
  }

  // Update an existing organization
  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { OrganizationName, Description, ContactEmail, ContactPhone, Address, OrganizationType } = req.body;

    if (!id) {
       res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    try {
      const updateResult = await OrganizationRepository.update(id, {
        OrganizationName,
        Description,
        ContactEmail,
        ContactPhone,
        Address,
        OrganizationType,
      });

      if (updateResult.success) {
        res.status(200).json({ success: true, message: 'Organization updated successfully', data: updateResult.data });
      } else {
        res.status(404).json({ success: false, message: updateResult.message });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update organization', error: err.message });
    }
  }

  // Delete an organization
  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
       res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    try {
      const deleteResult = await OrganizationRepository.delete(id);
      if (deleteResult.success) {
        res.status(200).json({ success: true, message: deleteResult.message });
      } else {
        res.status(404).json({ success: false, message: deleteResult.message });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete organization', error: err.message });
    }
  }
}