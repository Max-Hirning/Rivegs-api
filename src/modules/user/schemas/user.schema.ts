import mongoose, {Document} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Image} from '../../../modules/image/schemas/image.schema';

@Schema()
export class User extends Document {
  @Prop({required: true})
    login: string;

  @Prop({required: true})
    email: string;

  @Prop({required: true})
    password: string;

  @Prop({required: false})
    description?: string;

  @Prop({required: false, type: Number, default: 0.1})
    version: number;

  @Prop({type: [String], required: false, default: []})
    savedRecipes?: string[];

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: false, default: null})
    imageId?: Image['_id'];
}

export const UserSchema = SchemaFactory.createForClass(User);