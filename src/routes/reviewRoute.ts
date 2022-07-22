import express from 'express';
import { protect, restrictTo } from '../controllers/authController';
import {
  addReview,
  deleteReview,
  getAllReview,
  getReview,
  updateReview,
} from '../controllers/reviewController';

const reviewsRouter = express.Router();

reviewsRouter.use(protect);

reviewsRouter.route('/').get(getAllReview).post(restrictTo('user'), addReview);

reviewsRouter
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);

export default reviewsRouter;
