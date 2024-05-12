const { register, login, createAccount, getAccounts } = require('./controllers');

module.exports = async function (fastify) {
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                },
                required: ['email', 'password'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
        handler: register,
        tags: ['accounts'],
    });

    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                },
                required: ['email', 'password'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: { 
                            type: 'object',
                            properties: {
                                user: { 
                                    type: 'object',  
                                    properties: {
                                        id: { type: 'string' },
                                        email: { type: 'string' }
                                    }
                                },
                                session: { 
                                    type: 'object',
                                    properties: {
                                        access_token: { type: 'string'},
                                        refresh_token: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
        handler: login,
        tags: ['accounts'],
    });

    fastify.post('/accounts', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    accountType: { type: 'string' }
                },
                required: ['accountType'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: { 
                            type: 'object', 
                            properties: {
                                type: { type: 'string' },
                                balance: { type: 'integer' },
                                userId: { type: 'string' }
                            } 
                        }
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
        handler: createAccount,
        tags: ['accounts'],
    });

    fastify.get('/accounts', {
        schema: {
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string' },
                            userId: { type: 'string' },
                            balance: { type: 'integer' }
                        },
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
        handler: getAccounts,
        tags: ['accounts'],
    });
};
