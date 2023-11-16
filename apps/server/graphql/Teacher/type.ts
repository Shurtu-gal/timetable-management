import { objectType } from 'nexus';

export const Teacher = objectType({
  name: 'Teacher',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.int('userId');
    t.nonNull.int('collegeId');
    t.string('department');
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

    t.list.field('lectures', {
      type: 'Lecture',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.lecture.findMany({
          where: {
            instructorId: parent.id,
          },
        });
      },
    });

    t.list.field('assignedClasses', {
      type: 'Class',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.class.findMany({
          where: {
            facultyId: parent.id,
          },
        });
      },
    });
  },
});
