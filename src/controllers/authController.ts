import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import UserModel, { IUser } from '../models/userModel';
import AppError from '../utils/AppError';
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

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = <IUser>req.body;

    // todo 1) check if email and password exist
    if (!email || !password)
      next(new AppError('Please provide email and password!', 400));

    // todo 2) check if user exists && password is correct
    const user = await UserModel.findOne({ email }).select('+password');

    const isCorrect = await user?.isPasswordCorrect(password, user.password);

    if (!user || !isCorrect)
      return next(new AppError('Incorrect email or password', 401));

    // todo 3) If everything ok, send token to client
    return createSendToken(user, 200, res);
  }
);

export interface CustomRequest extends Request {
  user?: {
    id: Types.ObjectId;
    role: IUser['role'];
  };
}

export const product = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // todo 1) Getting the token and check if it exit
    let token;
    if (req.headers?.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    console.log({ token });

    if (!token)
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );

    // todo 2) Varification token
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
    console.log({ decoded });

    // todo 3) Check if user still exists
    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser)
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );

    // todo 4) Check if user changed password after the token was issued
    if (currentUser.isPasswordChangedAfterThisToken(decoded.iat))
      return next(
        new AppError('The user changed password after this token', 401)
      );

    // ? GRANT ACCESS TO PRODUCTED ROUTE
    req.user = { id: currentUser.id, role: currentUser.role };
    return next();
  }
);

export const restrictTo =
  (...roles: IUser['role'][]) =>
  (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role!)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    return next();
  };
