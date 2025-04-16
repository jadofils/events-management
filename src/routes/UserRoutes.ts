import { Router } from 'express';
import { UserController } from '../controller/user/Registration'; 
import { LoginController } from '../controller/user/Login'; 
import ResetPassword from '../controller/user/ResetDefaultPassword';
import { verifyJWT } from '../middlewares/AuthMiddleware';
const router = Router();

// Public routes
router.post('/register', UserController.register); 
router.post('/default-login-password', LoginController.loginWithDefaultPassward); // Corrected this line
router.post('/login', LoginController.login); // Corrected this line
router.post('/reset-password', ResetPassword.resetDefaultPassword);
router.post('/request-forget-password-link', ResetPassword.forgotPasswordLink);
router.post('/forget-password', ResetPassword.forgotPasswordLinkByUsernameOrEmail); // Added this line

// Protected routes
// router.use(authMiddleware);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id',verifyJWT, UserController.updateUser);
router.delete('/:id',verifyJWT, UserController.deleteUser);

export const userRoutes = router;