// src/routes/apiRoutes.ts
import { Router } from 'express';
import { userRoutes } from './UserRoutes';
import roleRoutes from './RoleRoutes';
import organizationRoutes from './OrganizationRoutes';

const router = Router();

// Use versioned routes
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/organizations', organizationRoutes); // This makes `/api/v1/organizations/*` available

export default router;
