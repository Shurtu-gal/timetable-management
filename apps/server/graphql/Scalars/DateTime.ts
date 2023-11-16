import { DateTimeResolver } from 'graphql-scalars';
import { asNexusMethod } from 'nexus';

export const DateScalar = asNexusMethod(DateTimeResolver, 'date');
