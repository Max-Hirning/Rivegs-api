import {Injectable} from '@nestjs/common';
import {CreateImageDto} from './dto/create-image.dto';
import {UpdateImageDto} from './dto/update-image.dto';

@Injectable()
export class ImageService {
  create(createImageDto: CreateImageDto): string {
    console.log(createImageDto);
    return 'This action adds a new image';
  }

  findAll(): string {
    return 'This action returns all image';
  }

  findOne(id: number): string {
    return `This action returns a #${id} image`;
  }

  update(id: number, updateImageDto: UpdateImageDto): string {
    console.log(updateImageDto);
    return `This action updates a #${id} image`;
  }

  remove(id: number): string {
    return `This action removes a #${id} image`;
  }
}
