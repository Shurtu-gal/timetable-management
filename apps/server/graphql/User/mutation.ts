import {
  inputObjectType,
  intArg,
  mutationField,
  nonNull,
  stringArg,
} from 'nexus';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../config';
import { checkPermissions } from '../../helpers/auth/checkPermissions';
import { AuthenticationError } from '../../helpers';

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

export const UserUpdateInputType = inputObjectType({
  name: 'UserUpdateInputType',
  definition(t) {
    t.string('email');
    t.string('firstName');
    t.string('lastName');
    t.string('uid');
    t.string('mobile');
    t.string('profile');
    t.date('dob');
    t.gender('gender');
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

export const updateProfile = mutationField('updateProfile', {
  type: 'User',
  args: {
    id: intArg(),
    data: nonNull('UserUpdateInputType'),
  },
  authorize: (_parent, _args, ctx) => {
    return _args.id
      ? checkPermissions(ctx, ['ADMIN'])
      : checkPermissions(ctx, []);
  },
  resolve: async (_, { data, id }, ctx) => {
    const userId = id || ctx.auth?.id;

    if (!userId) {
      throw AuthenticationError;
    }

    const user = await ctx.prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email || undefined,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        mobile: data.mobile || undefined,
        profile: data.profile || undefined,
        dob: data.dob || undefined,
        gender: data.gender || undefined,
        uid: data.uid || undefined,
      },
    });
    return user;
  },
});

export const changePassword = mutationField('changePassword', {
  type: 'Boolean',
  args: {
    uid: stringArg(),
    oldPassword: stringArg(),
    newPassword: nonNull(stringArg()),
  },
  resolve: async (_, { uid, oldPassword, newPassword }, ctx) => {
    if (uid && oldPassword) {
      const user = await ctx.prisma.user.findUnique({ where: { uid } });
      if (!user) {
        throw new Error(`No user found for uid: ${uid}`);
      }

      const passwordValid = await compare(oldPassword, user.password);
      if (!passwordValid) {
        throw new Error('Invalid password');
      }

      const password = await hash(newPassword, 10);
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { password },
      });

      return true;
    } else {
      if (!ctx.auth?.id) {
        throw AuthenticationError;
      }

      const password = await hash(newPassword, 10);
      await ctx.prisma.user.update({
        where: { id: ctx.auth?.id },
        data: { password },
      });

      return true;
    }
  },
});
