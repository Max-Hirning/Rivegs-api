import mongoose, {Document} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Image} from '../../../modules/image/schemas/image.schema';

@Schema()
export class RecipeType extends Document {
  @Prop({required: true})
    title: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true})
    imageId: Image['_id'];
}

export const RecipeTypeSchema = SchemaFactory.createForClass(RecipeType);