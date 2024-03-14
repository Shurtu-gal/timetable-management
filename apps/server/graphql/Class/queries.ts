import { intArg, list, nonNull, queryField, stringArg } from 'nexus';
import { checkPermissions } from '../../helpers/auth/checkPermissions';
import { ROLE } from '@prisma/client';

export const classQuery = queryField('class', {
  type: list(nonNull('Class')),
  description: 'Find classes according to the given arguments',
  args: {
    id: intArg(),
    name: stringArg(),
    department: stringArg(),
    semester: intArg(),
    collegeId: intArg(),
    teacherId: intArg(),
  },
  resolve: async (_, args, { prisma }) => {
    const { id, name, department, semester, collegeId, teacherId } = args;

    const prismaQuery = {
      id: id || undefined,
      name: name || undefined,
      department: department || undefined,
      semester: semester || undefined,
      collegeId: collegeId || undefined,
      teacherId: teacherId || undefined,
    };

    if (id || name || department || semester || collegeId || teacherId) {
      return await prisma.class.findMany({
        where: prismaQuery,
      });
    }

    if (checkPermissions([ROLE.ADMIN, ROLE.TEACHER])) {
      return await prisma.class.findMany();
    } else {
      throw new Error('Not authorized');
    }
  },
});
