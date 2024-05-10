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
        if (request.url === '/register' || request.url === '/login' || request.url === '/docs') {
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

const createDBUser = async (userData) => {
    try {
        const { data, error } = await supabase.from('user').insert(userData);
        if (error) throw error;
        return data;
    } catch(err) {
        console.log("Error creating user", err);
        throw err;
    }
}

const createAuthUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        return data.user.id;
    } catch(err) {
        console.log("Error creating auth user", err);
        throw err;
    }
}

const authLogin = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        return data;
    } catch (err) {
        console.log("Error Logging in:", err);
        throw err;
    }
}

// Register a new user
fastify.post('/register', async (request, reply) => {
    try {
        const { email, password } = request.body;
        
        let authId = await createAuthUser(email, password);

        await createDBUser({ auth_id: authId, email });

        return reply.send({ message: 'Registration successful'});
    } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Failed to register user' });
    }
});

// Login user
fastify.post('/login', async (request, reply) => {
    try {
        const { email, password } = request.body;

        let data = await authLogin(email, password);

        return reply.send({ message: 'Login successful', data });
    } catch (error) {
        reply.status(400).send({ error: 'Failed to login' });
    }
});

fastify.post('/accounts', async (request, reply) => {
    try {
        const { accountType } = request.body;
        
        const newAccount = await prisma.account.create({
            data: {
                userId: request.user.id,
                type: accountType,
                balance: 0
            }
        });

        reply.send(newAccount);
    } catch (error) {
        reply.status(500).send({ error: 'Failed to create account' });
    }
});

fastify.get('/accounts', async (request, reply) => {
    try {
        const accounts = await prisma.account.findMany({
            where: {
                userId: request.user.id,
            },
        });

        reply.send(accounts);
    } catch (error) {
        reply.status(500).send({ error: 'Failed to retrieve user accounts' });
    }
});

// Run the server
const start = async () => {
    try {
        await fastify.listen(3000);
        fastify.log.info(`Account Manager service listening on ${fastify.server.address().port}`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
