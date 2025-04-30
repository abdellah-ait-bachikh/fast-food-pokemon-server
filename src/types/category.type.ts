import { Category, User } from "@prisma/client";

export type TcreateCatgory = Pick<Category,'name'|'position'> & {image?:File}
export type TupdateCategory = Omit<Category,"updatedAt"|"createdAt"|"id"|"imageUri"> &{image?:File,imageUri?:string | null}