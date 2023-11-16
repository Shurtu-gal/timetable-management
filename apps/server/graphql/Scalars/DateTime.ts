import { DateTimeResolver } from 'graphql-scalars';
import { asNexusMethod } from 'nexus';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const DateTime = asNexusMethod(DateTimeResolver, 'date');
