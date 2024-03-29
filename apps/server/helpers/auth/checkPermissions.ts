import { ROLE } from '@prisma/client';
import { Context } from '../../config';
import { Response } from 'express';

export const ERRORS = {
  UNAUTHORIZED: {
    message: 'Unauthorized: Token not found',
    code: 401,
  },
  FORBIDDEN: {
    message: 'Permission Denied',
    code: 403,
  },
  BAD_REQUEST: {
    message: 'Bad Request',
    code: 400,
  },
  INTERNAL_SERVER: {
    message: 'Internal Server Error',
    code: 500,
  },
};

export class CustomError extends Error {
  code = 0;

  constructor(props: { code: number; message: string }) {
    super(props.message);
    this.code = props.code;
  }
}

export type ErrorParam = {
  message: string;
  code: number;
};

export const gqlErrorHandler = (error: ErrorParam) => new CustomError(error);

export type CheckPermissionsType = {
  ctx: Context;
  successHandler:
    | (() => Promise<Response<unknown, Record<string, unknown>>>)
    | (() => boolean);
  errorHandler: (
    error: ErrorParam,
  ) => Response<unknown, Record<string, unknown>> | Error;
  requiredRoles: ROLE[];
  viewId?: number;
};

const checkBasePermissions = async ({
  ctx,
  successHandler,
  errorHandler,
  requiredRoles,
  viewId,
}: CheckPermissionsType) => {
  if (!ctx.auth) return errorHandler(ERRORS.UNAUTHORIZED);

  try {
    if (ctx.auth?.role === ROLE.SUPERADMIN || requiredRoles.length === 0) {
      return successHandler();
    }

    const role = requiredRoles.find(role => role === ctx.auth?.role);

    if (!role) return errorHandler(ERRORS.FORBIDDEN);

    switch (ctx.auth?.role) {
      case ROLE.ADMIN:
        if (ctx.auth?.admin?.collegeId === viewId) return successHandler();
        break;
      case ROLE.TEACHER:
        if (ctx.auth?.teacher?.collegeId === viewId) return successHandler();
        break;
      case ROLE.STUDENT:
        if (ctx.auth?.student?.classId === viewId) return successHandler();
        break;
      default:
        return errorHandler(ERRORS.FORBIDDEN);
    }

    return errorHandler(ERRORS.FORBIDDEN);
  } catch (error) {
    console.error(error);
    return errorHandler(ERRORS.INTERNAL_SERVER);
  }
};

export const checkPermissions = (
  context: Context,
  requiredRoles: ROLE[],
  viewId?: number,
): Promise<boolean | Error> => {
  const successHandler = () => true;

  return checkBasePermissions({
    ctx: context,
    successHandler,
    errorHandler: gqlErrorHandler,
    requiredRoles,
    viewId,
  }) as Promise<boolean | Error>;
};
