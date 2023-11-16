import { list, objectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('uid');
    t.string('email');
    t.nonNull.string('firstName');
    t.string('lastName');
    t.string('name', {
      resolve(parent) {
        return `${parent.firstName} ${parent.lastName}`;
      },
    });
    t.date('dob');
    t.nonNull.gender('gender');
    t.string('mobile');
    t.string('profile');
    t.role('role');

    t.date('createdAt');
    t.date('updatedAt');

    t.field('admin', {
      type: 'Admin',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.admin.findUnique({
          where: {
            userId: parent.id,
          },
        });
      },
    });

    t.field('student', {
      type: 'Student',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.student.findUnique({
          where: {
            userId: parent.id,
          },
        });
      },
    });

    t.field('teacher', {
      type: 'Teacher',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.teacher.findUnique({
          where: {
            userId: parent.id,
          },
        });
      },
    });

    t.field('comments', {
      type: list('Comment'),
      resolve: async (parent, _, { prisma }) => {
        return await prisma.comment.findMany({
          where: {
            userId: parent.id,
          },
        });
      },
    });
  },
});
