import * as bcrypt from 'bcrypt';
import {IUser} from './types/user';
import {DBs} from '../../configs/DBs';
import mongoose, {Model} from 'mongoose';
import {User} from './schemas/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {AuthSuccessMessages} from '../../configs/messages/auth';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserErrorMessages, UserSuccessMessages} from '../../configs/messages/user';

@Injectable()
export class UserService {
  constructor(@InjectModel(DBs.users) private readonly userModel: Model<User>) {}

  async remove(id: string): Promise<string> {
    await this.userModel.deleteOne({_id: id});
    return UserSuccessMessages.removeOne;
  }

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
        $addFields: {
          avatar: {
            $arrayElemAt: ['$image.url', 0]
          },
        },
      },
      {
        $project: {
          __v: 0,
          image: 0,
          imageId: 0,
          password: 0,
        },
      },
      {
        $lookup: {
          let: { 
            userId: '$_id' 
          },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $eq: ['$authorId', '$$userId'] 
                }
              }
            },
            {
              $project: {
                _id: 1
              }
            }
          ],
          as: 'recipes',
          from: 'recipes',
        }
      },
      {
        $addFields: {
          recipesIds: '$recipes._id'
        }
      },
      {
        $project: {
          recipes: 0
        }
      }
    ]);
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return user;
  }

  async updateSavedRecipes(id: string, savedRecipes: string[]): Promise<string> {
    await this.userModel.updateOne({_id: id}, {savedRecipes});
    return UserSuccessMessages.updateOne;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto, imageId?: string): Promise<string> {
    await this.userModel.updateOne({_id: id}, {
      imageId,
      email: updateProfileDto.email,
      login: updateProfileDto.login,
      __v: updateProfileDto.email ? 0 : 1,
      description: updateProfileDto.description,
    });
    if(updateProfileDto.email) return AuthSuccessMessages.sentEmail;
    return UserSuccessMessages.updateOne;
  }

  async updateSecurity(id: string, updateSecurityDto: UpdateSecurityDto): Promise<string> {
    const password = await bcrypt.hash(updateSecurityDto.password, 5);
    await this.userModel.updateOne({_id: id}, {password});
    return UserSuccessMessages.updateOne;
  }
}
