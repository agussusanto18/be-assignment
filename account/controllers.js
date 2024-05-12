const Account = require('./models');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPEBASE_URL, process.env.SUPEBASE_API_KEY);


const createDBUser = async (userData) => {
    try {
        const { data, error } = await supabase.from('user').insert(userData);
        if (error) throw error;
        return data;
    } catch (err) {
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
    } catch (err) {
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

async function register(request, reply) {
    try {
        const { email, password } = request.body;

        let authId = await createAuthUser(email, password);

        await createDBUser({ auth_id: authId, email });

        return reply.send({ message: 'Registration successful' });
    } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Failed to register user' });
    }
}

async function login(request, reply) {
    try {
        const { email, password } = request.body;

        let data = await authLogin(email, password);

        const response = {
            message: 'Login successful',
            data: {
                user: data.user,
                session: data.session
            }
        };

        return reply.send(response);
    } catch (error) {
        reply.status(400).send({ error: 'Failed to login' });
    }
}

async function createAccount(request, reply) {
    try {
        const { accountType } = request.body;

        const newAccount = new Account({
            userId: request.user.id,
            type: accountType,
        });

        await newAccount.save();

        reply.send({ message: 'Account has been created successfully', data: newAccount});
    } catch (error) {
        reply.status(500).send({ error: 'Failed to create account' });
    }
}

async function getAccounts(request, reply) {
    try {
        const accounts = await Account.find({ userId: request.user.id });

        reply.send(accounts);
    } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Failed to retrieve user accounts' });
    }
}

module.exports = { register, login, createAccount, getAccounts };
