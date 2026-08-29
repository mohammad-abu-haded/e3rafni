import { Role } from "@/app/generated/prisma/enums";

export type User = {
  id: number;
  role: Role;
  name: string;
  email: string;
  password: string | null;
  googleId: string | null;
  createdAt: Date;
};

export type ApiResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};