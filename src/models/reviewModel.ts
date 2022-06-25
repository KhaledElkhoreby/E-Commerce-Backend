import mongoose, { Schema, Types } from 'mongoose';

interface IReview {
    product: Types.ObjectId;
    review: string;
    rating: number;
    user: Types.ObjectId;
}

const reviewSchema = new mongoose.Schema<IReview>({
    product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'product',
    },
    review: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    user: {
        type: Schema.Types.ObjectId,
        required: [true, 'Review must belong to a user'],
        ref: 'user',
    },
});

const ReviewModel = mongoose.model<IReview>('review', reviewSchema);

export default ReviewModel;
