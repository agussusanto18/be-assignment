const swaggerConfig = {
    routePrefix: '/documentation',
    exposeRoute: true,
    swagger: {
        info: {
            title: 'Transaction API Documentation',
            description: 'API documentation for transaction endpoints',
            version: '1.0.0'
        },
        securityDefinitions: {
            apiKey: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: 'JWT token'
            }
        },
        security: [{ apiKey: [] }], // Apply security to all endpoints
        externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here'
        },
        consumes: ['application/json'],
        produces: ['application/json']
    }
}

const swaggerUIConfig = {
    routePrefix: '/documentation',
    swagger: {
        url: '/documentation/json'
    },
    config: {
        docExpansion: 'list',
        deepLinking: false
    }
}

module.exports = { swaggerConfig, swaggerUIConfig };
