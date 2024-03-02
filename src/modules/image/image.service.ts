import {Model} from 'mongoose';
import {DBs} from 'src/configs/DBs';
import {IImage} from './types/image';
import {Image} from './schemas/image.schema';
import {InjectModel} from '@nestjs/mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ImageErrorMessages, ImageSuccessMessages} from 'src/configs/messages/image';
import {v2 as cloudinary, UploadApiErrorResponse, UploadApiOptions, UploadApiResponse} from 'cloudinary';

@Injectable()
export class ImageService {
  constructor(@InjectModel(DBs.images) private readonly imageModel: Model<Image>) {}

  async remove(id: string): Promise<string> {
    const image = await this.findOne(id);
    const {result} = await cloudinary.uploader.destroy(image.id);
    if(result === 'ok') {
      await this.imageModel.deleteOne({_id: id});
      return ImageSuccessMessages.removeOne;
    }
    throw new HttpException(ImageErrorMessages.removeOne, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async findOne(id: string): Promise<IImage> {
    const image = await this.imageModel.findOne({_id: id});
    if(!image) throw new HttpException(ImageErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return image;
  }

  async findAll(ids: string[], noCheck?: boolean): Promise<IImage[]> {
    const images = await this.imageModel.find({_id: {$in: ids}});
    if(!noCheck) {
      if(images.length === 0) throw new HttpException(ImageErrorMessages.findAll, HttpStatus.NOT_FOUND);
    }
    return images;
  }

  async removeAll(ids: string[]): Promise<string> {
    const images = await this.findAll(ids, true);
    const imagesIds = images.map(({id}: IImage) => id);
    await cloudinary.api.delete_resources(imagesIds);
    await this.imageModel.deleteMany({_id: {$in: ids}});
    return ImageSuccessMessages.removeAll;
  }

  async create(file: Buffer, options: Required<Pick<UploadApiOptions, 'folder'>>): Promise<string> {
    const {public_id, secure_url}: UploadApiResponse|UploadApiErrorResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          ...options,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(file);
    });
    if(public_id && secure_url) {
      const {_id} = await this.imageModel.create({
        id: public_id,
        url: secure_url,
      });
      return _id;
    }
    throw new HttpException(ImageErrorMessages.createOne, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async update(id: string, file: Buffer, options: Required<Pick<UploadApiOptions, 'folder'>>): Promise<string> {
    const image = await this.findOne(id);
    const {public_id, secure_url}: UploadApiResponse|UploadApiErrorResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          ...options,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(file);
    });
    if(public_id && secure_url) {
      const {result} = await cloudinary.uploader.destroy(image.id);
      if(result === 'ok') {
        await this.imageModel.updateOne({_id: id}, {
          id: public_id,
          url: secure_url,
        });
        return ImageSuccessMessages.updateOne;
      }
    }
    throw new HttpException(ImageErrorMessages.removeOne, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
