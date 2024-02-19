import {ConfigOptions, v2} from 'cloudinary';
import {ConfigService} from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (): ConfigOptions => {
    return v2.config({
      api_key: process.env.CLOUDINARY_APIKEY,
      cloud_name: process.env.CLOUDINARY_CLOUDNAME,
      api_secret: process.env.CLOUDINARY_APISECRET,
    });
  },
  inject: [ConfigService],
};