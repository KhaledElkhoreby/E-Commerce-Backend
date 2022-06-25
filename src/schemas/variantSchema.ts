import mongoose from 'mongoose';

export interface IVariant {
    price: number;
    color: string;
    size: string;
    count: number;
}
const variantSchema = new mongoose.Schema<IVariant>({
    price: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXl'],
    },
    count: {
        type: Number,
        required: true,
        default: 1,
    },
});

export default variantSchema;
