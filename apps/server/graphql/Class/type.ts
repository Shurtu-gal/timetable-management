import { inputObjectType, objectType } from 'nexus';

export const Class = objectType({
  name: 'Class',
  description: 'Class',
  definition(t) {
    t.nonNull.int('id');
    t.string('description');
    t.string('department');
    t.int('semester');
    t.nonNull.int('collegeId');
    t.int('facultyId');
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
            id: parent.facultyId || undefined,
          },
        });
      },
    });
  },
});

export const ClassCreateInputType = inputObjectType({
  name: 'ClassCreateInputType',
  description: 'ClassCreateInputType',
  definition(t) {
    t.nonNull.int('semester');
    t.nonNull.string('department');
    t.int('collegeId');
    t.int('facultyId');
    t.string('description');
  },
});
