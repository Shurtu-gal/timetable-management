import { objectType } from 'nexus';

export const Student = objectType({
  name: 'Student',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.int('userId');
    t.nonNull.int('classId');
    t.date('createdAt');
    t.date('updatedAt');

    t.field('user', {
      type: 'User',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.user.findUnique({
          where: {
            id: parent.userId,
          },
        });
      },
    });

    t.field('class', {
      type: 'Class',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.class.findUnique({
          where: {
            id: parent.classId,
          },
        });
      },
    });
  },
});
