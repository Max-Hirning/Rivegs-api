import mongoose, {Document} from 'mongoose';
import {User} from 'src/modules/user/schemas/user.schema';
import {Image} from 'src/modules/image/schemas/image.schema';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {RecipeType} from 'src/modules/recipe-type/schemas/recipe-type.schema';

@Schema()
export class Recipe extends Document {
  @Prop({ 
    type: [
      {
        value: String,
        bold: Boolean,
        italic: Boolean,
        underlined: Boolean,
      }
    ],
    required: true 
  })
    steps: { id: string, value: string, bold: boolean, italic: boolean, underlined: boolean }[];

  @Prop({ 
    type: [
      {
        value: String,
        bold: Boolean,
        italic: Boolean,
        underlined: Boolean,
      }
    ],
    required: true 
  })
    ingredients: { id: string, value: string, bold: boolean, italic: boolean, underlined: boolean }[];

  @Prop({required: true})
    title: string;

  @Prop()
    description?: string;

  @Prop({default: 3})
    rate?: number;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true})
    imageId: Image['_id'];

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    authorId: User['_id'];

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'RecipeType', required: true})
    typeId: RecipeType['_id'];
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
