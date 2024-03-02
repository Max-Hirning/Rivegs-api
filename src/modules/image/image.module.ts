import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {ImageService} from './image.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageSchema} from './schemas/image.schema';
import {CommonModule} from '../common/common.module';
import {CloudinaryProvider} from './providers/cloudinary.provider';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([{name: DBs.images, schema: ImageSchema}]),
  ],
  exports: [ImageService, CloudinaryProvider],
  providers: [ImageService, CloudinaryProvider],
})
export class ImageModule {}
