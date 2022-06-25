import mongoose from 'mongoose';
import variantSchema, { IVariant } from '../schemas/variantSchema';

export interface IProduct {
    category: string;
    brand: string;
    brand_thumbnail: string;
    title: string;
    description: string;
    countReview: number;
    productRating: number;
    variants: IVariant[];
    availble: boolean;
}

export const productShecma = new mongoose.Schema<IProduct>(
    {
        category: {
            type: String,
            required: true,
            enum: ['Shirts', 'Pants', 'T-shirts', 'Sportswear'],
        },
        brand: {
            type: String,
            required: true,
        },
        brand_thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        countReview: {
            type: Number,
            required: true,
        },
        productRating: {
            type: Number,
            required: true,
        },
        variants: [
            {
                type: variantSchema,
            },
        ],
        availble: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
        },
    }
);

const ProductModel = mongoose.model<IProduct>('product', productShecma);

export default ProductModel;
