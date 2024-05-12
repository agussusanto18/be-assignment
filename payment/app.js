const Fastify = require('fastify'); 
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');

const supabase = createClient(process.env.SUPEBASE_URL, process.env.SUPEBASE_API_KEY);

// MongoDB connection URL
const mongoURL = process.env.MONGO_URI;

const connectDB = async () => {
    await mongoose.connect(mongoURL);
    console.log('MongoDb Connected');
}

connectDB();

const Transaction = mongoose.model('Transaction', {
    accountId: String,
    amount: Number,
    currency: String,
    toAddress: String,
    status: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const authenticate = async (request, reply) => {
    try {
        if (request.url.includes('/documentation')) {
            return;
        } else {
            const token = request.headers.authorization;
            const tokenStr = token.split(" ")[1]
            const { data: { user } } = await supabase.auth.getUser(tokenStr)

            if (!user) {
                throw new Error('Authentication failed');
            }

            request.user = user;

            return;
        }
    } catch (error) {
        console.log(error);
        reply.code(401).send({ error: 'Authentication failed' });
    }
};



function processTransaction(transaction) {
    return new Promise((resolve, reject) => {
        console.log('Transaction processing started for:', transaction);
        
        setTimeout(() => {
            // After 30 seconds, we assume the transaction is processed successfully
            console.log('transaction processed for:', transaction);
            resolve(transaction);
        }, 30000); // 30 seconds
    });
}

(async () => {
        const fastify = Fastify({
            logger: true,
            ajv: {
                customOptions: {
                    keywords: ['collectionFormat']
                }
            }
        });

        await fastify.addHook('preHandler', authenticate);

        await fastify.register(require('@fastify/swagger'))
        await fastify.register(require('@fastify/swagger-ui'), {
            routePrefix: '/documentation',
            components: {
                securitySchemes: {
                    BearerAuth: {
                        description:
                            "RSA256 JWT signed by private key, with username in payload",
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            uiConfig: {
                docExpansion: 'full',
                deepLinking: false
            },
            uiHooks: {
                onRequest: function (request, reply, next) { next() },
                preHandler: function (request, reply, next) { next() }
            },
            staticCSP: true,
            transformStaticCSP: (header) => header,
            transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
            transformSpecificationClone: true
        })

        fastify.route({
            method: 'POST',
            url: '/transactions/send',
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
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
                params: {
                    type: 'object',
                    properties: {
                        accountId: {
                            type: 'string',
                            description: 'ID of the account to retrieve transactions for',
                        },
                        amount: {
                            type: 'integer',
                            description: 'Amount of money to withdraw',
                        },
                        toAddress: {
                            type: 'string',
                            description: 'ID of the account to send transactions to',
                        },
                    },
                    required: ['accountId', 'amount', 'toAddress'],
                },
            },
            tags: ['transactions'],
            async handler(request, reply) {
                try {
                    const { accountId, amount, toAddress } = request.body;
                    const transaction = new Transaction({
                        accountId,
                        amount,
                        currency: 'IDR',
                        toAddress,
                    });

                    await transaction.save();

                    await processTransaction(transaction);

                    transaction.status = 'completed';
                    await transaction.save();

                    reply.send({ message: 'Transaction completed successfully' });
                } catch (error) {
                    reply.status(500).send({ error: 'Failed to process transaction' });
                }
            },
        });

        fastify.route({
            method: 'POST',
            url: '/transactions/withdraw',
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
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
                params: {
                    type: 'object',
                    properties: {
                        accountId: {
                            type: 'string',
                            description: 'ID of the account to retrieve transactions for',
                        },
                        amount: {
                            type: 'integer',
                            description: 'Amount of money to withdraw',
                        },
                    },
                    required: ['accountId', 'amount'],
                },
            },
            tags: ['transactions'],
            async handler(request, reply) {
                try {
                    const { accountId, amount } = request.body;
                    const transaction = new Transaction({
                        accountId,
                        amount: -amount,
                        currency: 'IDR',
                    });

                    await transaction.save();

                    await processTransaction(transaction);

                    transaction.status = 'completed';
                    await transaction.save();

                    reply.send({ message: 'Withdrawal completed successfully' });
                } catch (error) {
                    reply.status(500).send({ error: 'Failed to process withdrawal' });
                }
            },
        });


        fastify.route({
            method: 'GET',
            url: '/transactions/retrieve/:accountId',
            schema: {
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
                params: {
                    type: 'object',
                    properties: {
                        accountId: {
                            type: 'string',
                            description: 'ID of the account to retrieve transactions for',
                        },
                    },
                    required: ['accountId'],
                },
            },
            tags: ['transactions'],
            async handler(request, reply) {
                try {
                    const { accountId } = request.params;

                    const transactions = await Transaction.find({ accountId });

                    reply.send(transactions);
                } catch (error) {
                    console.log(error);
                    reply.status(500).send({ error: 'Failed to retrieve transaction history' });
                }
            },
        });


        fastify.listen({ port: 3001 }, (err, addr) => {
            if (err) throw err
            fastify.log.info(`Payment service listening on ${fastify.server.address().port}`);
        });
    }
    )()