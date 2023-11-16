import { objectType } from 'nexus';

export const Lecture = objectType({
  name: 'Lecture',
  definition(t) {
    t.nonNull.int('courseId');
    t.nonNull.int('classId');
    t.nonNull.int('instructorId');
    t.nonNull.string('name');
    t.string('description');
    t.string('section');
    t.date('createdAt');
    t.date('updatedAt');

    t.field('course', {
      type: 'Course',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.course.findUnique({
          where: {
            id: parent.courseId,
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

    t.field('instructor', {
      type: 'Teacher',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.teacher.findUnique({
          where: {
            id: parent.instructorId,
          },
        });
      },
    });

    t.list.field('timeSlots', {
      type: 'TimeSlot',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.timeSlot.findMany({
          where: {
            courseId: parent.courseId,
            classId: parent.classId,
          },
        });
      },
    });
  },
});
