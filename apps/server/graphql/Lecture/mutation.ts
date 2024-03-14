import { mutationField, nonNull } from 'nexus';
import { checkPermissions } from '../../helpers/auth/checkPermissions';

export const createLecture = mutationField('createLecture', {
  type: 'Lecture',
  authorize: (_, __, ctx) => {
    return checkPermissions(ctx, ['ADMIN', 'SUPERADMIN']);
  },
  args: {
    data: nonNull('CreateLectureInputType'),
  },
  resolve: async (_, { data }, { prisma }) => {
    let instructorId = data.instructorId;
    if (!data.instructorId && !data.instructor?.userId)
      throw new Error('Instructor id or instructor user id is required');
    if (!data.instructorId && data.instructor?.user) {
      const teacher_ = await prisma.teacher.create({
        data: {
          department: data.instructor?.department || undefined,
          user: {
            connectOrCreate: {
              where: {
                id: data.instructor?.userId || undefined,
              },
              create: {
                uid: data.instructor?.user.uid,
                email: data.instructor?.user?.email,
                firstName: data.instructor?.user?.firstName,
                lastName: data.instructor?.user?.lastName,
                mobile: data.instructor?.user?.mobile || undefined,
                profile: data.instructor?.user?.profile || undefined,
                gender: data.instructor.user.gender,
                dob: data.instructor.user.dob || undefined,
                password: data.instructor.user.password,
                role: 'TEACHER',
              },
            },
          },
          college: {
            connect: {
              id: data.instructor?.collegeId || undefined,
            },
          },
        },
      });

      await prisma.user.update({
        where: {
          id: teacher_.userId,
        },
        data: {
          role: 'TEACHER',
        },
      });

      if (teacher_) instructorId = teacher_.id;
      else throw new Error('Error creating teacher');
    } else if (!data.instructorId && data.instructor?.userId) {
      const teacher = await prisma.teacher.findUnique({
        where: {
          userId: data.instructor?.userId || undefined,
        },
      });

      if (teacher) throw new Error('Teacher already exists');

      const [teacher_] = await prisma.$transaction([
        prisma.teacher.create({
          data: {
            department: data.instructor?.department || undefined,
            user: {
              connect: {
                id: data.instructor?.userId || undefined,
              },
            },
            college: {
              connect: {
                id: data.instructor?.collegeId || undefined,
              },
            },
          },
        }),
        prisma.user.update({
          where: {
            id: data.instructor?.userId || undefined,
          },
          data: {
            role: 'TEACHER',
          },
        }),
      ]);

      if (teacher_) instructorId = teacher_.id;
      else throw new Error('Error creating teacher');
    }

    return prisma.lecture.create({
      data: {
        name: data.name,
        description: data.description || undefined,
        section: data.section || undefined,
        course: {
          connect: {
            id: data.courseId,
          },
        },
        class: {
          connect: {
            id: data.classId,
          },
        },
        instructor: {
          connect: {
            id: (data.instructorId || instructorId) as number,
          },
        },
        timeSlot: data.timeSlots
          ? {
              createMany: {
                data: data.timeSlots?.map(timeSlot => ({
                  startTime: timeSlot.startTime,
                  endTime: timeSlot.endTime,
                  day: timeSlot.day,
                  extraClass: timeSlot.extraClass || undefined,
                  date: timeSlot.date || undefined,
                  room: timeSlot.room || undefined,
                })),
              },
            }
          : undefined,
      },
    });
  },
});
