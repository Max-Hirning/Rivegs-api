import {Model} from 'mongoose';
import {DBs} from 'src/configs/DBs';
import {JwtService} from '@nestjs/jwt';
import {IUser} from '../user/types/user';
import {IImage} from '../image/types/image';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../user/schemas/user.schema';
import {Image} from '../image/schemas/image.schema';
import {MailerService} from '@nestjs-modules/mailer';
import {Recipe} from '../recipe/schemas/recipe.schema';
import {UserErrorMessages} from 'src/configs/messages/user';
import {IRecipeType} from '../recipe-type/types/recipe-type';
import {ImageErrorMessages} from 'src/configs/messages/image';
import {RecipeErrorMessages} from 'src/configs/messages/recipe';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {RecipeType} from '../recipe-type/schemas/recipe-type.schema';
import {RecipeTypeErrorMessages} from 'src/configs/messages/recipe-type';

@Injectable()
export class CommonService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectModel(DBs.users) private readonly userModel: Model<User>,
    @InjectModel(DBs.images) private readonly imageModel: Model<Image>,
    @InjectModel(DBs.users) private readonly recipeModel: Model<Recipe>,
    @InjectModel(DBs.recipesTypes) private readonly recipeTypeModel: Model<RecipeType>
  ) {}

  async findOneUserAPI(id: string): Promise<IUser> {
    const user = await this.userModel.findOne({_id: id});
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return user;
  }

  async findOneImageAPI(id: string): Promise<IImage> {
    const image = await this.imageModel.findOne({_id: id});
    if(!image) throw new HttpException(ImageErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return image;
  }

  async findOneRecipeAPI(id: string): Promise<IRecipeType> {
    const recipe = await this.recipeModel.findOne({_id: id});
    if(!recipe) throw new HttpException(RecipeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return recipe;
  }

  async findOneRecipeTypeAPI(id: string): Promise<IRecipeType> {
    const recipeType = await this.recipeTypeModel.findOne({_id: id});
    if(!recipeType) throw new HttpException(RecipeTypeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return recipeType;
  }

  async sendConfirmEmail(emailReceiver: string, codePayload: Pick<IUser, 'email'|'_id'|'password'>): Promise<void> {
    const code = this.jwtService.sign(codePayload, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${process.env.ORIGIN_API_URL}/confirm-email?code=${code}">Confirm your email to proceed using our service</a>
        </div>
      `,
      to: emailReceiver,
      subject: 'Confirm your email',
    });
  }
}
