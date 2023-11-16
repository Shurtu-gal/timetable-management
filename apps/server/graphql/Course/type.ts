import { objectType } from 'nexus';

export const Course = objectType({
  name: 'Course',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('name');
    t.string('description');
    t.string('type');
    t.int('credits');
    t.nonNull.int('collegeId');
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

    t.list.field('lectures', {
      type: 'Lecture',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.lecture.findMany({
          where: {
            courseId: parent.id,
          },
        });
      },
    });
  },
});
