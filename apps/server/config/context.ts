import { Request } from 'express';

import { PrismaClient, User } from '@prisma/client';
import { verifyUser } from '../helpers';

export const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn'],
});

export interface Context {
  prisma: PrismaClient;
  req: Request;
  auth?: User;
}

export const context = async ({ req }: { req: Request }): Promise<Context> => ({
  prisma,
  req,
  auth: (await verifyUser(req)) || undefined,
});
