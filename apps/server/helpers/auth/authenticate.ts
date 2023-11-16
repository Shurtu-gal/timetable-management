import { JWT_SECRET, prisma } from '../../config';
import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

type Decoded = JwtPayload & {
  email?: string;
  userId: number;
  role: string;
};

export const verifyUser = async (req: Request) => {
  const token = req.headers.authorization || '';
  if (!token) return null;

  const bearer = token.split(' ')[1];
  if (!bearer) return null;

  const decoded = jwt.verify(bearer, JWT_SECRET || '') as Decoded;

  const authUser = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  return authUser;
};
