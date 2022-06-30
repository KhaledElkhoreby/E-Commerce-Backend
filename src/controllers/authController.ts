import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import UserModel, { IUser } from '../models/userModel';
import catchAsync from '../utils/catchAsync';

const SECRET_KEY = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN!;

const signToken = (id: Types.ObjectId) =>
  jwt.sign({ id }, SECRET_KEY, { expiresIn: EXPIRES_IN });

const createSendToken = (
  user: mongoose.Document & IUser,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user._id as unknown as Types.ObjectId);
  //#region
  const cookieOptions = {
    expires: new Date(Date.now() + +EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  //#endregion

  // Remove password from output
  (user.password as unknown as undefined) = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm, role } = <IUser>req.body;
    const newUser = await UserModel.create({
      name,
      email,
      password,
      passwordConfirm,
      role,
    });
    return createSendToken(newUser, 201, res);
  }
);
