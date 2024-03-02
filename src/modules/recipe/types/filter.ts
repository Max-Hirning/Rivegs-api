import mongoose from 'mongoose';

interface IFilterIds {
  $in: mongoose.Types.ObjectId[];
}

interface IFilterRate {
  $gte: string;
  $lte: string;
}

interface IFilterTitle { 
  $regex: RegExp;
}

export interface IFilter {
  _id: IFilterIds;
  rate: IFilterRate;
  title: IFilterTitle;
  'author.login': string;
  pagination: IFilterPagination;
  typeId: mongoose.Types.ObjectId;
}

interface IFilterPagination {
  skip: number;
  pageSize: number;
}