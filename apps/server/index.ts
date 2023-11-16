import http from 'http';
import app from './rest/server';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { Context, schema, context, PORT, winston } from './config';

async function run() {
  const logger = winston('server');

  const httpServer = http.createServer(app);
  const apolloServer = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    logger: process.env.NODE_ENV === 'development' ? logger : undefined,
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context,
    }),
  );

  const port = PORT || 4000;

  httpServer.listen(port, () => {
    logger.info(`🚀 Server ready at http://localhost:${port}`);
    logger.info(`🚀 GraphQL ready at http://localhost:${port}/graphql`);
  });
}

run();
