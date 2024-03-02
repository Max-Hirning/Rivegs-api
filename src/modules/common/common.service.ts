import {Model} from 'mongoose';
import {DBs} from 'src/configs/DBs';
import {JwtService} from '@nestjs/jwt';
import {IUser} from '../user/types/user';
import {InjectModel} from '@nestjs/mongoose';
import {IRecipe} from '../recipe/types/recipe';
import {User} from '../user/schemas/user.schema';
import {MailerService} from '@nestjs-modules/mailer';
import {Recipe} from '../recipe/schemas/recipe.schema';
import {UserErrorMessages} from 'src/configs/messages/user';
import {IRecipeType} from '../recipe-type/types/recipe-type';
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
    @InjectModel(DBs.recipes) private readonly recipeModel: Model<Recipe>,
    @InjectModel(DBs.recipesTypes) private readonly recipeTypeModel: Model<RecipeType>
  ) {}

  async findOneRecipeTypeAPI(key: '_id', value: string, noCheck?: boolean): Promise<IRecipeType> {
    const recipeType = await this.recipeTypeModel.findOne({[key]: value});
    if(!noCheck) {
      if(!recipeType) throw new HttpException(RecipeTypeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return recipeType;
  }

  async findOneUserAPI(key: '_id'|'email'|'login', value: string, noCheck?: boolean): Promise<IUser> {
    const user = await this.userModel.findOne({[key]: value});
    if(!noCheck) {
      if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findRecipesAPI(key: 'typeId'|'authorId'|'_id', value: string, noCheck?: boolean): Promise<IRecipe[]> {
    const recipes = await this.recipeModel.find({[key]: value});
    if(!noCheck) {
      if(recipes.length === 0) throw new HttpException(RecipeErrorMessages.findAll, HttpStatus.NOT_FOUND);
    }
    return recipes;
  }

  async findOneRecipeAPI(key: 'typeId'|'authorId'|'_id', value: string, noCheck?: boolean): Promise<IRecipe> {
    const recipe = await this.recipeModel.findOne({[key]: value});
    if(!noCheck) {
      if(!recipe) throw new HttpException(RecipeErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return recipe;
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
