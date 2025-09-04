import { IAddress } from "./IAddress";
import { IImage } from "./IImage";

export interface IUser {
  ID: number;
  Email: string;
  FirstName: string;
  Surname: string;
  PhoneNumber: string;
  PhotoProfile: IImage;
  Addresses: IAddress[];
  Address?: string;
}