import { Request } from 'express';

import { Admin, PrismaClient, Student, Teacher, User } from '@prisma/client';
import { verifyUser } from '../helpers';

export type AuthUser = User &
  (
    | {
        role: 'ADMIN';
        admin: Admin;
      }
    | {
        role: 'STUDENT';
        student: Student;
      }
    | {
        role: 'TEACHER';
        teacher: Teacher;
      }
    | {
        role: null | 'SUPERADMIN';
      }
  );

export const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn'],
});

export interface Context {
  prisma: PrismaClient;
  req: Request;
  auth?: AuthUser;
}

export const context = async ({ req }: { req: Request }): Promise<Context> => ({
  prisma,
  req,
  auth: ((await verifyUser(req)) as AuthUser) || undefined,
});
