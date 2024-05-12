const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPEBASE_URL, process.env.SUPEBASE_API_KEY);

async function authenticate(request, reply) {
    try {
        if (request.url.includes('/documentation')) {
            return;
        } else {
            const token = request.headers.authorization;
            const tokenStr = token
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
}

module.exports = { authenticate };
