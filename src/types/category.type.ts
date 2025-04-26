import { Category, User } from "@prisma/client";

export type TcreateCatgory = Pick<Category,'name'|'position'>