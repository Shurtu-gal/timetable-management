import { fieldAuthorizePlugin, makeSchema } from 'nexus';
import { join } from 'path';

import * as types from '../graphql';

export const schema = makeSchema({
  types,
  outputs: {
    schema: join(process.cwd(), './nexus_generated/schema.graphql'),
    typegen: join(process.cwd(), './nexus_generated/nexus-typegen.ts'),
  },
  contextType: {
    module: join(process.cwd(), './config/context.ts'),
    export: 'Context',
  },
  plugins: [fieldAuthorizePlugin()],
});
