import { objectType } from 'nexus';

export const College = objectType({
  name: 'College',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('name');
    t.string('description');
    t.date('createdAt');
    t.date('updatedAt');

    t.field('admin', {
      type: 'Admin',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.admin.findUnique({
          where: {
            collegeId: parent.id,
          },
        });
      },
    });
  },
});
