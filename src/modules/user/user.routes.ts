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

const router = Router();

router.get('/', getAllUsers);
router.get('/stats', getStats);
router.get('/id/:id', getUserById);
router.get('/email/:email', getUserByEmail);
router.post('/', createUser);
router.post('/register', createUserWithProfile);
router.put('/:id', updateUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
