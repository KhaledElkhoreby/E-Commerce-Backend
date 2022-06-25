import mongoose, { Schema, Types } from 'mongoose';
import addressSchema, { IAddress } from '../schemas/addressSchema';

export interface IUser {
    name: string;
    email: string;
    password: string;
    address: IAddress[];
    cart: Types.ObjectId[];
    orders: Types.ObjectId[];
    role: 'admin' | 'user';
    paymentMethods: 'cash' | 'card';
    phone: string[];
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: [
        {
            type: addressSchema,
            required: true,
        },
    ],
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
});

const UserModel = mongoose.model<IUser>('user', userSchema);

export default UserModel;
