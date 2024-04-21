import mongoose, {Model} from 'mongoose';
import {User} from './schemas/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from 'configs/collections';
import {IUpdateProfile, IUpdateSecurity, IUser} from './types/user';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserErrorMessages, UserSuccessMessages} from 'configs/messages/user';

@Injectable()
export class UserService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  async findOne(id: string): Promise<IUser> {
    const [user] = await this.userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      {
        $lookup: {
          as: 'image',
          from: 'images',
          foreignField: '_id',
          localField: 'imageId',
        },
      },
      {
        $lookup: {
          as: 'recipes',
          from: 'recipes',
          localField: '_id',
          foreignField: 'authorId',
        },
      },
      {
        $addFields: {
          avatar: {
            $arrayElemAt: ['$image.url', 0]
          },
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          login: 1,
          avatar: 1,
          description: 1,
          savedRecipes: 1,
          recipeIds: '$recipes._id',
        },
      }
    ]);  
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return user;
  }

  async removeOne(id: string): Promise<string> {
    await this.userModel.deleteOne({_id: id});
    return UserSuccessMessages.removeOne;
  }

  async updateSecurity(id: string, updateSecurity: IUpdateSecurity): Promise<string> {
    await this.userModel.updateOne({_id: id}, {...updateSecurity, $inc: {version: 1}});
    return UserSuccessMessages.updateOne;
  }

  async updateProfile(id: string, updateUserProfile: Partial<IUpdateProfile>): Promise<string> {
    const data: Partial<IUpdateProfile> = {...updateUserProfile};
    if(updateUserProfile.email) {
      data['$inc'] = {version: 0.1};
      data['__v'] = 0;
    }
    await this.userModel.updateOne({_id: id}, data);
    return UserSuccessMessages.updateOne;
  }
}
