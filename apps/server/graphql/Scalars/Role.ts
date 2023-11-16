import { enumType } from 'nexus';

export const RoleType = enumType({
  name: 'RoleType',
  members: ['ADMIN', 'STUDENT', 'SUPERADMIN', 'TEACHER'],
  asNexusMethod: 'role',
});
