const fastify = require('fastify')();
const { connectDB } = require('./config');
const routes = require('./routes');
const { swaggerConfig, swaggerUIConfig } = require('./swagger');
const { authenticate } = require('./middlewares');

(async () => {
    try {
        await connectDB();

        await fastify.register(require('@fastify/swagger'), swaggerConfig);
        await fastify.register(require('@fastify/swagger-ui'), swaggerUIConfig);

        fastify.addHook('preHandler', authenticate);
        fastify.register(routes);
        
        await fastify.listen(3001, '0.0.0.0');
        console.log(`Server listening on ${fastify.server.address().port}`);
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
})();
