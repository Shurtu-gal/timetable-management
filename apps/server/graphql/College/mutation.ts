import { mutationField, nonNull } from 'nexus';
import { checkPermissions } from '../../helpers/auth/checkPermissions';

export const createCollege = mutationField('createCollege', {
  type: 'College',
  args: {
    data: nonNull('CollegeCreateInputType'),
  },
  authorize: (_, __, ctx) => {
    return checkPermissions(ctx, ['SUPERADMIN']);
  },
  resolve: async (_root, { data }, ctx) => {
    await ctx.prisma.user.update({
      where: {
        id: data.adminId,
      },
      data: {
        role: 'ADMIN',
      },
    });

    return ctx.prisma.college.create({
      data: {
        name: data.name,
        description: data.description || undefined,
        courses: data.courses
          ? {
              createMany: {
                data: data.courses.map(course => ({
                  name: course.name,
                  description: course.description || undefined,
                  type: course.type || undefined,
                  credits: course.credits,
                })),
                skipDuplicates: true,
              },
            }
          : undefined,
        admin: {
          connectOrCreate: {
            where: {
              id: data.adminId,
            },
            create: {
              userId: data.adminId,
            },
          },
        },
        classes: data.classes
          ? {
              createMany: {
                data: data.classes.map(class_ => ({
                  description: class_.description || undefined,
                  department: class_.department,
                  semester: class_.semester,
                })),
                skipDuplicates: true,
              },
            }
          : undefined,
      },
    });
  },
});

export const deleteCollege = mutationField('deleteCollege', {
  type: 'College',
  args: {
    id: nonNull('Int'),
  },
  authorize: (_, __, ctx) => {
    return checkPermissions(ctx, ['SUPERADMIN']);
  },
  resolve: async (_, { id }, { prisma }) => {
    // Transaction delete all classes, courses, admin, and teachers
    await prisma.$transaction([
      prisma.course.deleteMany({
        where: {
          collegeId: id,
        },
      }),
      prisma.class.deleteMany({
        where: {
          collegeId: id,
        },
      }),
      prisma.admin.delete({
        where: {
          collegeId: id,
        },
      }),
      prisma.teacher.deleteMany({
        where: {
          collegeId: id,
        },
      }),
    ]);

    return prisma.college.delete({
      where: {
        id: id,
      },
    });
  },
});
