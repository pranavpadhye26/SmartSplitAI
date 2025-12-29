
export interface Expense {
    id: string;
    amount: number;
    paidById: string;
    currency: string;
    splits: {
        userId: string;
        amount: number;
    }[];
}

export interface Settlement {
    fromUserId: string;
    toUserId: string;
    amount: number;
    currency: string;
}

export function calculateSettlements(expenses: Expense[]) {
    // 1. Calculate net balance for each user
    const balances: Record<string, number> = {};

    expenses.forEach((expense) => {
        // Payer of the expense gets positive balance (they are owed money)
        balances[expense.paidById] = (balances[expense.paidById] || 0) + expense.amount;

        // Each person in the split owes money (negative balance)
        expense.splits.forEach((split) => {
            balances[split.userId] = (balances[split.userId] || 0) - split.amount;
        });
    });

    // 2. Separate into debtors (owe money) and creditors (owed money)
    const debtors: { userId: string; amount: number }[] = [];
    const creditors: { userId: string; amount: number }[] = [];

    Object.entries(balances).forEach(([userId, amount]) => {
        // Filter out small floating point discrepancies
        if (amount < -0.01) debtors.push({ userId, amount }); // negative amount (owes)
        if (amount > 0.01) creditors.push({ userId, amount }); // positive amount (is owed)
    });

    // Sort by magnitude to optimize matching (greedy approach)
    // Debtors: Ascending (most negative first, e.g. -100 before -10)
    debtors.sort((a, b) => a.amount - b.amount);
    // Creditors: Descending (most positive first, e.g. +100 before +10)
    creditors.sort((a, b) => b.amount - a.amount);

    // 3. Match them up
    const settlements: Settlement[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what's owed vs what's needed
        // Math.abs(debtor.amount) is what they owe. creditor.amount is what they are owed.
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        if (amount > 0.01) {
            // Create settlement suggestion
            settlements.push({
                fromUserId: debtor.userId,
                toUserId: creditor.userId,
                amount: Number(amount.toFixed(2)),
                currency: "USD", // Simplification: assuming single currency or converted
            });
        }

        // Update remaining balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // If fully settled (close to 0), move to next
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return {
        totalNetworkDebt: settlements.reduce((acc, s) => acc + s.amount, 0),
        settlements,
    };
}
