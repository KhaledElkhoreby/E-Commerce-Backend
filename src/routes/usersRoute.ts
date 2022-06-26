import express from 'express';
import {
  addUser,
  deleteUser,
  getAllUser,
  getUser,
  updateUser,
} from '../controllers/productControllers';
const usersRouter = express.Router();

usersRouter.route('/').get(getAllUser).post(addUser);
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default usersRouter;
