import { mutationField, nonNull } from 'nexus';
import { checkPermissions } from '../../helpers/auth/checkPermissions';
import { Teacher } from '@prisma/client';

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

    const _college = await ctx.prisma.college.create({
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
      include: {
        admin: true,
        classes: true,
        courses: true,
        teachers: true,
        _count: true,
      },
    });

    if (!_college.id) {
      throw new Error('College not created');
    }

    /**
     * @abstract As prisma does not support nested createMany, we have to create teachers separately
     * @see https://github.com/prisma/prisma/issues/5455
     */

    const teachers_: Teacher[] = [];

    data.teachers?.forEach(async teacher => {
      let teacher_;
      if (teacher.user) {
        teacher_ = await ctx.prisma.teacher.create({
          data: {
            department: teacher.department || undefined,
            user: {
              create: {
                email: teacher.user.email || undefined,
                firstName: teacher.user.firstName,
                lastName: teacher.user.lastName,
                mobile: teacher.user.mobile || undefined,
                profile: teacher.user.profile || undefined,
                dob: teacher.user.dob || undefined,
                uid: teacher.user.uid,
                gender: teacher.user.gender,
                password: teacher.user.password,
                role: 'TEACHER',
              },
            },
            college: {
              connect: {
                id: _college.id,
              },
            },
          },
        });
      } else if (teacher.userId) {
        [teacher_] = await ctx.prisma.$transaction([
          ctx.prisma.teacher.create({
            data: {
              department: teacher.department || undefined,
              user: {
                connect: {
                  id: teacher.userId,
                },
              },
              college: {
                connect: {
                  id: _college.id,
                },
              },
            },
          }),
          ctx.prisma.user.update({
            where: {
              id: teacher.userId,
            },
            data: {
              role: 'TEACHER',
            },
          }),
        ]);
      } else {
        teacher_ = null;
      }

      if (teacher_) {
        teachers_.push(teacher_);
      }
    });

    _college.teachers = teachers_;

    return _college;
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
