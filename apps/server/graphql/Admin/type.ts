import { objectType } from 'nexus';

export const Admin = objectType({
  name: 'Admin',
  description: 'Admin',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.int('userId');
    t.nonNull.int('collegeId');
    t.date('createdAt');
    t.date('updatedAt');
    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        return await ctx.prisma.user.findUnique({
          where: {
            id: parent.userId,
          },
        });
      },
    });

    t.field('college', {
      type: 'College',
      resolve: async (parent, _args, ctx) => {
        return await ctx.prisma.college.findUnique({
          where: {
            id: parent.collegeId,
          },
        });
      },
    });
  },
});
