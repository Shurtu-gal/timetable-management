import { objectType } from 'nexus';

export const Class = objectType({
  name: 'Class',
  description: 'Class',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('name');
    t.string('description');
    t.string('department');
    t.int('semester');
    t.nonNull.int('collegeId');
    t.nonNull.int('facultyId');
    t.date('createdAt');
    t.date('updatedAt');

    t.field('college', {
      type: 'College',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.college.findUnique({
          where: {
            id: parent.collegeId,
          },
        });
      },
    });

    t.field('faculty', {
      type: 'Teacher',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.teacher.findUnique({
          where: {
            id: parent.facultyId,
          },
        });
      },
    });
  },
});
