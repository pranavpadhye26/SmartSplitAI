import { db } from "./src/lib/db";

async function testDatabase() {
    console.log("🔍 Testing database connection...\n");

    try {
        // Test 1: Database connection
        await db.$connect();
        console.log("✅ Database connected successfully!");

        // Test 2: Query database
        const userCount = await db.user.count();
        console.log(`✅ User table accessible (${userCount} users)`);

        const groupCount = await db.group.count();
        console.log(`✅ Group table accessible (${groupCount} groups)`);

        const expenseCount = await db.expense.count();
        console.log(`✅ Expense table accessible (${expenseCount} expenses)`);

        const splitCount = await db.split.count();
        console.log(`✅ Split table accessible (${splitCount} splits)`);

        const settlementCount = await db.settlement.count();
        console.log(`✅ Settlement table accessible (${settlementCount} settlements)`);

        console.log("\n🎉 All database tests passed!");
        console.log("\n📊 Database Summary:");
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Groups: ${groupCount}`);
        console.log(`   - Expenses: ${expenseCount}`);
        console.log(`   - Splits: ${splitCount}`);
        console.log(`   - Settlements: ${settlementCount}`);

    } catch (error) {
        console.error("\n❌ Database test failed:");
        console.error(error);
        process.exit(1);
    } finally {
        await db.$disconnect();
        console.log("\n🔌 Database disconnected");
    }
}

testDatabase();
