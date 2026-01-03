import express from 'express';
import cookieParser from 'cookie-parser';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.use(errorMiddleware);

export default app;
