import express from 'express';
import { protect, restrictTo } from '../controllers/authController';
import {
  addProduct,
  deleteProduct,
  getAllProduct,
  getProduct,
  updateProduct,
} from '../controllers/productController';
const productsRouter = express.Router();

productsRouter
  .route('/')
  .get(getAllProduct)
  .post(protect, restrictTo('admin'), addProduct);
productsRouter
  .route('/:id')
  .get(getProduct)
  .patch(protect, restrictTo('admin'), updateProduct)
  .delete(protect, restrictTo('admin'), deleteProduct);

export default productsRouter;
