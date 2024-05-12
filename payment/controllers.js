const Transaction = require('./models');

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

async function postTransaction(request, reply) {
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
        console.log(error);
        reply.status(500).send({ error: 'Failed to process transaction' });
    }
}

async function withdrawTransaction(request, reply) {
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
}

async function retrieveTransactions(request, reply) {
    try {
        const { accountId } = request.params;
        const transactions = await Transaction.find({ accountId });

        const transformedTransactions = transactions.map(transaction => ({
            accountId: transaction.accountId
        }));

        reply.send(transformedTransactions);
    } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Failed to retrieve transaction history' });
    }
}

module.exports = { postTransaction, withdrawTransaction, retrieveTransactions };
