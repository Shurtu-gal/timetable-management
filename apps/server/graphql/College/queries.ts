import { intArg, nonNull, objectType, queryField, stringArg } from 'nexus';
import { checkPermissions } from '../../helpers/auth/checkPermissions';

export const PaginatedCollegeType = objectType({
  name: 'PaginatedCollegeType',
  description: 'Paginated response for college query',
  definition(t) {
    t.list.field('data', {
      type: 'College',
    });
    t.int('count');
  },
});

export const getCollegeById = queryField('getCollegeById', {
  type: 'College',
  args: {
    id: nonNull(intArg()),
  },
  resolve: (_, { id }, ctx) => {
    return ctx.prisma.college.findUnique({
      where: {
        id: id,
      },
    });
  },
});

export const getColleges = queryField('college', {
  type: PaginatedCollegeType,
  args: {
    id: intArg(),
    name: stringArg(),
    description: stringArg(),
    pagination: 'paginationInputType',
  },
  authorize: (_, __, ctx) => {
    return checkPermissions(ctx, ['SUPERADMIN']);
  },
  resolve: async (_, args, { prisma }) => {
    const query = {
      id: args.id || undefined,
      name: args.name || undefined,
      description: args.description || undefined,
    };

    const pagination = args.pagination;

    const [colleges, count] = await prisma.$transaction([
      prisma.college.findMany({
        skip: pagination?.skip,
        take: pagination?.take,
        where: query,
      }),
      prisma.college.count({
        where: query,
      }),
    ]);

    return {
      data: colleges,
      count,
    };
  },
});
