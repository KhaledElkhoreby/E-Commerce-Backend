import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Model } from 'mongoose';
import { ParsedUrlQueryInput } from 'querystring';
import APIFeatures from './APIFeatures';
import AppError from './AppError';
import catchAsync from './catchAsync';

export const deleteModel = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateModel = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const createModel = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const getOne = (
  Model: Model<any>,
  populateOptions: string | string[]
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const query = Model.findById(id);
    if (populateOptions) query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const getAll = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // ! To allow for nested GET reviews on tours (Hack)
    const filter = req.params.tourId ? { tour: req.params.tourId } : {};

    // Bulid Query
    const feartures = new APIFeatures(
      Model.find(filter),
      req.query as ParsedUrlQueryInput
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute query
    // const docs = await feartures.query.explain(); //! to get info of request and show difference between how many documents is explored after and before add index to database
    const docs = await feartures.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
