import mongoose, {Document} from 'mongoose';
import {Image} from 'src/modules/image/schemas/image.schema';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

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

  @Prop({type: [String], required: false, default: []})
    savedRecipes?: string[];

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: false, default: null})
    imageId?: Image['_id'];
}

export const UserSchema = SchemaFactory.createForClass(User);
