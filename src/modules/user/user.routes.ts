import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getStats,
  createUser,
  createUserWithProfile,
  updateUser,
  deleteUser,
} from './user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/stats', authMiddleware, getStats);
router.get('/id/:id', authMiddleware, getUserById);
router.get('/email/:email', authMiddleware, getUserByEmail);
router.post('/', authMiddleware, createUser);
router.post('/register', createUserWithProfile);
router.put('/:id', authMiddleware, updateUser);
router.patch('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
