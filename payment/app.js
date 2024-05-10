// accountApp.js

const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();
const supabase = createClient('https://zcttnclmfownxehjggvf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHRuY2xtZm93bnhlaGpnZ3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyOTg3NDgsImV4cCI6MjAzMDg3NDc0OH0.Y92rhNtbPJbS0Ihm8q1l8vTNsrOtuY6jXdDZsrKFTb8');

// MongoDB connection URL
// const mongoURL = 'mongodb://localhost:27017';
const mongoURL = "mongodb+srv://otnasussuga:Otnasus180800@helperior.e36hcqk.mongodb.net/?retryWrites=true&w=majority&appName=Helperior";
const mongoClient = new MongoClient(mongoURL);

// Connect to MongoDB
mongoClient.connect((err) => {
    if (err) {
        console.error('Failed to connect to MongoDB');
        process.exit(1);
    }
    console.log('Connected to MongoDB');
});

const authenticate = async (request, reply) => {
    try {
        if (request.url === '/docs') {
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

fastify.addHook('preHandler', authenticate);

function processTransaction(transaction) {
    return new Promise((resolve, reject) => {
        console.log('Transaction processing started for:', transaction);

        // Simulate long running process
        setTimeout(() => {
            // After 30 seconds, we assume the transaction is processed successfully
            console.log('transaction processed for:', transaction);
            resolve(transaction);
        }, 30000); // 30 seconds
    });
}

fastify.post('/send', async (request, reply) => {
    try {
        const { accountId, amount, toAddress } = request.body;
        const transaction = await prisma.transaction.create({
            data: {
                accountId,
                amount,
                currency: 'IDR',
                toAddress,
                status: 'pending'
            },
        });

        await processTransaction(transaction);
        
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'completed' },
        });
        reply.send({ message: 'Transaction completed successfully' });
    } catch (error) {
        reply.status(500).send({ error: 'Failed to process transaction' });
    }
});

fastify.post('/withdraw', async (request, reply) => {
    try {
        const { accountId, amount } = request.body;
        const transaction = await prisma.transaction.create({
            data: {
                accountId,
                amount: -amount, 
                currency: 'IDR',
                status: 'pending',
            },
        });
        await processTransaction(transaction);
        
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'completed' },
        });
        reply.send({ message: 'Withdrawal completed successfully' });
    } catch (error) {
        reply.status(500).send({ error: 'Failed to process withdrawal' });
    }
});

fastify.get('/transactions/:accountId', async (request, reply) => {
    try {
        const { accountId } = request.params;

        const transactions = await prisma.transaction.findMany({
            where: {
                accountId: accountId
            }
        });

        reply.send(transactions);
    } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Failed to retrieve transaction history' });
    }
});

// Run the server
const start = async () => {
    try {
        await fastify.listen(3001);
        fastify.log.info(`Account Manager service listening on ${fastify.server.address().port}`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
