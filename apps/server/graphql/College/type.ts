import { inputObjectType, objectType } from 'nexus';
import { checkPermissions } from '../../helpers/auth/checkPermissions';

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

    t.list.nonNull.field('courses', {
      type: 'Course',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.course.findMany({
          where: {
            collegeId: parent.id,
          },
        });
      },
    });

    t.list.nonNull.field('classes', {
      type: 'Class',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.class.findMany({
          where: {
            collegeId: parent.id,
          },
        });
      },
    });

    t.list.nonNull.field('teachers', {
      type: 'Teacher',
      resolve: async (parent, _, { prisma }) => {
        return await prisma.teacher.findMany({
          where: {
            collegeId: parent.id,
          },
        });
      },
    });
  },
});

export const CollegeCreateInputType = inputObjectType({
  name: 'CollegeCreateInputType',
  definition(t) {
    t.string('description');
    t.nonNull.string('name');
    t.nonNull.int('adminId');
    t.list.nonNull.field('courses', {
      type: 'CourseCreateInputType',
    });
    t.list.nonNull.field('classes', {
      type: 'ClassCreateInputType',
    });
    t.list.nonNull.field('teachers', {
      type: 'TeacherCreateNodeType',
      authorize: (_, __, ctx) => {
        return checkPermissions(ctx, ['SUPERADMIN', 'ADMIN']);
      },
    });
  },
});
