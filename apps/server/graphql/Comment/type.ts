import { objectType } from 'nexus';

export const Comment = objectType({
  name: 'Comment',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('text');
    t.nonNull.int('userId');
    t.nonNull.int('timeSlotId');
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

    t.field('timeSlot', {
      type: 'TimeSlot',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.timeSlot.findUnique({
          where: {
            id: parent.timeSlotId,
          },
        });
      },
    });
  },
});
