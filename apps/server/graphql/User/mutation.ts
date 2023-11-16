import { inputObjectType, mutationField, nonNull, stringArg } from 'nexus';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../config';

export const UserCreateInputType = inputObjectType({
  name: 'UserCreateInputType',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('password');
    t.nonNull.string('firstName');
    t.nonNull.string('lastName');
    t.nonNull.string('uid');
    t.string('mobile');
    t.string('profile');
    t.date('dob');
    t.nonNull.gender('gender');
  },
});

export const signup = mutationField('signup', {
  type: 'AuthPayload',
  args: {
    data: nonNull('UserCreateInputType'),
  },
  resolve: async (_, { data }, ctx) => {
    const password = await hash(data.password, 10);
    const user = await ctx.prisma.user.create({
      data: { ...data, password },
    });

    return {
      token: sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET || 'secret',
        {
          expiresIn: JWT_EXPIRES_IN || '1d',
        },
      ),
      user,
    };
  },
});

export const login = mutationField('login', {
  type: 'AuthPayload',
  args: {
    uid: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  resolve: async (_, { uid, password }, ctx) => {
    const user = await ctx.prisma.user.findUnique({ where: { uid } });
    if (!user) {
      throw new Error(`No user found for uid: ${uid}`);
    }

    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid password');
    }

    return {
      token: sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET || 'secret',
        {
          expiresIn: JWT_EXPIRES_IN || '1d',
        },
      ),
      user,
    };
  },
});
