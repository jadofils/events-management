// src/routes/OrganizationRoutes.ts
import { Router } from 'express';
import { OrganizationController } from '../controller/OrganizationController';

const router = Router();

// All other organization routes
router.get('/all', OrganizationController.getAll);
router.get('/:id', OrganizationController.getById);
router.post('/add', OrganizationController.create);
router.put('/update/:id', OrganizationController.update);
router.delete('/delete/:id', OrganizationController.delete);

// Add user to organization (ensure the correct route is defined)
router.put('/addUser', OrganizationController.addUserToOrganization);

export default router;
