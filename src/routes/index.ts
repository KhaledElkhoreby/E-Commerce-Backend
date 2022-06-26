import { Router } from 'express';
import usersRouter from './usersRoute';

const indexRouter = Router();

indexRouter.use('/users', usersRouter);
// indexRouter.use('/reviews', reviewsRouter);
// indexRouter.use('/orders', ordersRouter);

export default indexRouter;
