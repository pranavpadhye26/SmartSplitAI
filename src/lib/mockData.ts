export const CURRENT_USER = {
    id: "user_1",
    name: "Pranav",
    email: "pranav@example.com",
};

export const MOCK_GROUPS = [
    {
        id: "g_1",
        name: "Roommates 2024",
        members: [
            { id: "user_1", name: "Pranav", avatar: "P" },
            { id: "user_2", name: "Alice", avatar: "A" },
            { id: "user_3", name: "Bob", avatar: "B" },
        ],
        expenses: 12,
        totalBalance: 150.00, // Positive means you are owed
        currency: "USD",
    },
    {
        id: "g_2",
        name: "Hawaii Trip",
        members: [
            { id: "user_1", name: "Pranav", avatar: "P" },
            { id: "user_4", name: "Charlie", avatar: "C" },
            { id: "user_5", name: "Dave", avatar: "D" },
            { id: "user_6", name: "Eve", avatar: "E" },
        ],
        expenses: 5,
        totalBalance: -45.50, // Negative means you owe
        currency: "USD",
    },
];

export const MOCK_EXPENSES = [
    {
        id: "e_1",
        title: "Weekly Groceries",
        amount: 124.50,
        paidBy: { id: "user_1", name: "Pranav" },
        date: "2024-03-15T10:30:00Z",
        splitSummary: "You lent $83.00",
    },
    {
        id: "e_2",
        title: "Internet Bill",
        amount: 60.00,
        paidBy: { id: "user_2", name: "Alice" },
        date: "2024-03-14T09:00:00Z",
        splitSummary: "You owe $20.00",
    },
];
