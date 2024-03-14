import { inputObjectType, objectType } from 'nexus';

export const TimeSlot = objectType({
  name: 'TimeSlot',
  definition(t) {
    t.nonNull.int('id');
    t.string('day');
    t.string('startTime');
    t.string('endTime');
    t.date('date');
    t.boolean('extraClass');
    t.string('room');
    t.nonNull.int('classId');
    t.nonNull.int('courseId');
    t.date('createdAt');
    t.date('updatedAt');

    t.field('lecture', {
      type: 'Lecture',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.lecture.findUnique({
          where: {
            courseId_classId: {
              courseId: parent.courseId,
              classId: parent.classId,
            },
          },
        });
      },
    });

    t.list.field('comments', {
      type: 'Comment',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.comment.findMany({
          where: {
            timeSlotId: parent.id,
          },
        });
      },
    });
  },
});

export const TimeSlotCreateInputType = inputObjectType({
  name: 'TimeSlotCreateInputType',
  definition(t) {
    t.nonNull.string('day');
    t.nonNull.string('startTime');
    t.nonNull.string('endTime');
    t.int('classId');
    t.int('courseId');
    t.date('date');
    t.boolean('extraClass');
    t.string('room');
  },
});
