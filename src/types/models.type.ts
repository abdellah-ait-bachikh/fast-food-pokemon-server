import { Category, Day, User } from "@prisma/client";

//day 
export type TcreatDay = Omit<Day,"id">

//category
export type TcreateCatgory = Pick<Category,'name'|'position'> & {image?:File}
export type TupdateCategory = Omit<Category,"updatedAt"|"createdAt"|"id"|"imageUri"> &{image?:File,imageUri?:string | null}

