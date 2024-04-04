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
export interface IFilters {
  _id: IFilterIds;
  rate: IFilterRate;
  title: IFilterTitle;
  'author.login': string;
  typeId: mongoose.Types.ObjectId;
}