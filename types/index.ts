import { Role } from "@/app/generated/prisma/enums";

export type User = {
  id: number;
  role: Role;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};
