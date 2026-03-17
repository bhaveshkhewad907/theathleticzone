import { Request } from "express";
import { HydratedDocument } from "mongoose";
import { IUser } from "../modules/user/user.model";

export interface AuthenticatedRequest extends Request {
  user: HydratedDocument<IUser>;
}
