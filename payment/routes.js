const { postTransaction, withdrawTransaction, retrieveTransactions } = require('./controllers');

module.exports = async function (fastify) {
    fastify.post('/transactions/send', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    accountId: { type: 'string' },
                    amount: { type: 'number' },
                    toAddress: { type: 'string' },
                },
                required: ['accountId', 'amount', 'toAddress'],
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
        handler: postTransaction,
        tags: ['transactions'],
    });

    fastify.post('/transactions/withdraw', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    accountId: { type: 'string' },
                    amount: { type: 'number' },
                },
                required: ['accountId', 'amount'],
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
        handler: withdrawTransaction,
        tags: ['transactions'],
    });

    fastify.get('/transactions/retrieve/:accountId', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    accountId: { type: 'string' },
                },
                required: ['accountId'],
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            accountId: { type: 'string' },
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
        handler: retrieveTransactions,
        tags: ['transactions'],
    });
};
