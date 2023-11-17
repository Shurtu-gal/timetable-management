import { intArg, list, nonNull, queryField } from 'nexus';
import { checkPermissions } from '../../helpers/auth/checkPermissions';

export const getCoursesByCollegeId = queryField('getCoursesByCollegeId', {
  type: list('Course'),
  args: {
    collegeId: nonNull(intArg()),
  },
  authorize: (_, __, ctx) => {
    return checkPermissions(ctx, ['SUPERADMIN', 'ADMIN']);
  },
  resolve: async (_, { collegeId }, { prisma }) => {
    return await prisma.course.findMany({
      where: {
        collegeId,
      },
    });
  },
});

export const getCourseById = queryField('getCourseById', {
  type: 'Course',
  args: {
    id: nonNull(intArg()),
  },
  authorize: (_, __, ctx) => {
    return checkPermissions(ctx, []);
  },
  resolve: async (_, { id }, { prisma }) => {
    return await prisma.course.findUnique({
      where: {
        id,
      },
    });
  },
});

export const getCourses = queryField('getCourses', {
  type: list('Course'),
  authorize: (_, __, ctx) => {
    return checkPermissions(ctx, ['SUPERADMIN']);
  },
  resolve: async (_, __, { prisma }) => {
    return await prisma.course.findMany();
  },
});
