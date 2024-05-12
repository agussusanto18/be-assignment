// accountApp.js
require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPEBASE_URL, process.env.SUPEBASE_API_KEY);

// MongoDB connection URL
const mongoURL = process.env.MONGO_URI;

const connectDB = async () => {
    await mongoose.connect(mongoURL);
    console.log('MongoDb Connected');
}

connectDB();

const Account = mongoose.model('Account', {
    type: String,
    balance: { type: Number, default: 0 },
    userId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
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
        
        const newAccount = new Account({
            userId: request.user.id,
            type: accountType,
        });

        await newAccount.save();

        reply.send(newAccount);
    } catch (error) {
        reply.status(500).send({ error: 'Failed to create account' });
    }
});

fastify.get('/accounts', async (request, reply) => {
    try {
        const accounts = await Account.find({ userId: request.user.id });

        reply.send(accounts);
    } catch (error) {
        console.log(error);
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
