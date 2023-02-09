import { Router } from 'express';
import { createUser, filterContacts } from '../controllers/userController';

const router = Router();

router.post('/create', createUser);

router.post('/contacts-filter', filterContacts);

export { router as userRouter };
