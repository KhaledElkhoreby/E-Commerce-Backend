import mongoose, { Schema, Types } from 'mongoose';
import validator from 'validator';
import bycrypt from 'bcryptjs';
import addressSchema, { IAddress } from '../schemas/addressSchema';

export interface IUser {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  address: IAddress[];
  cart: Types.ObjectId[];
  orders: Types.ObjectId[];
  role: 'admin' | 'user';
  paymentMethods: 'cash' | 'card';
  phone: string[];
  passwordChangedAt: mongoose.Date;
  // passwordResetToken: String;
  // passwordResetExpires: mongoose.Date;
  active: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: [true, 'Please tell us your email!'],
    unique: true,
    trim: true,
    lowerCase: true,
    maxLength: [40, 'A user email must have less than or equal 40 characters'],
    minLength: [
      true,
      'A user email must have more than or equal 10 characters',
    ],
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    trim: true,
    minLength: [
      8,
      'A user password must have more than or equal to 8 characters',
    ],
    validate: [validator.isStrongPassword, 'Password is not strong'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    trim: true,
    minLength: [
      8,
      'A user password must have more than or equal to 8 characters',
    ],
    // This only works on CREATE and SAVE !!!
    validate: {
      validator(val: string) {
        return val === (this as unknown as IUser).password;
      },
      message: 'Please provide the same password',
    },
  },
  address: {
    type: [
      {
        type: addressSchema,
        required: true,
      },
    ],
    validate: [(el: []) => el.length <= 3, '{PATH} exceeds the limit of 3'],
  },
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: 'product',
    },
  ],
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: 'order',
    },
  ],
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
  },
  paymentMethods: [
    {
      type: String,
      enum: ['cash', 'card'],
    },
  ],
  phone: [
    {
      type: String,
      required: true,
    },
  ],
  passwordChangedAt: Date,
  // passwordResetToken: String,
  // passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//? Middleware before QUERY
userSchema.pre(/^find/, function (next) {
  UserModel.find({ active: { $ne: false } });
  return next();
});

//? Middleware before SAVE
userSchema.pre('save', async function (next) {
  // ! Only run this function if password was not actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bycrypt.hash(this.password, 12);

  // Delete password confirm value from the database
  (this.passwordConfirm as unknown as undefined) = undefined;

  return next();
});

//? This middleware for record when password is changed
userSchema.pre('save', function (next) {
  // ! Run this fucntin only when password is changed with existing user not new user.
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = (Date.now() - 1000) as unknown as mongoose.Date;
  return next();
});

// Method for check password is correct while Sign In
userSchema.methods.isPasswordCorrect = function (
  candidatePassword: string,
  encrybtedUserPassword: string
) {
  return bycrypt.compare(candidatePassword, encrybtedUserPassword);
};

const UserModel = mongoose.model<IUser>('user', userSchema);

export default UserModel;
