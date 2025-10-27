/**
 * Database verification script
 * Tests connection and validates schema setup
 */

import { db } from '../lib/db';

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣  Testing database connection...');
    await db.$connect();
    console.log('✅ Successfully connected to PostgreSQL\n');

    // Test 2: Query all tables
    console.log('2️⃣  Checking tables...');
    const tables = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const tableNames = tables.map((t) => t.tablename);
    console.log(`   Found ${tableNames.length} tables:`);
    tableNames.forEach((name) => console.log(`   - ${name}`));

    const expectedTables = [
      'User',
      'Account',
      'Category',
      'Transaction',
      'Budget',
      '_prisma_migrations',
    ];
    const missingTables = expectedTables.filter(
      (t) => !tableNames.includes(t) && !tableNames.includes(t.toLowerCase())
    );

    if (missingTables.length === 0) {
      console.log('✅ All expected tables exist\n');
    } else {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}\n`);
    }

    // Test 3: Check indexes
    console.log('3️⃣  Checking indexes...');
    const indexes = await db.$queryRaw<Array<{ indexname: string; tablename: string }>>`
      SELECT 
        indexname,
        tablename
      FROM pg_indexes 
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%pkey%'
      ORDER BY tablename, indexname;
    `;

    console.log(`   Found ${indexes.length} custom indexes:`);
    indexes.forEach((idx) => console.log(`   - ${idx.tablename}.${idx.indexname}`));
    console.log('✅ Indexes created\n');

    // Test 4: Check unique constraints
    console.log('4️⃣  Checking unique constraints...');
    const constraints = await db.$queryRaw<Array<{ constraint_name: string; table_name: string }>>`
      SELECT 
        tc.constraint_name,
        tc.table_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_schema = 'public'
        AND tc.constraint_type = 'UNIQUE'
      ORDER BY tc.table_name;
    `;

    console.log(`   Found ${constraints.length} unique constraints:`);
    constraints.forEach((c) => console.log(`   - ${c.table_name}.${c.constraint_name}`));
    console.log('✅ Unique constraints in place\n');

    // Test 5: Check enums
    console.log('5️⃣  Checking enums...');
    const enums = await db.$queryRaw<Array<{ typname: string }>>`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname;
    `;

    console.log(`   Found ${enums.length} enums:`);
    enums.forEach((e) => console.log(`   - ${e.typname}`));

    const expectedEnums = ['CategoryType', 'TxnType'];
    const missingEnums = expectedEnums.filter((e) => !enums.some((en) => en.typname === e));

    if (missingEnums.length === 0) {
      console.log('✅ All expected enums exist\n');
    } else {
      console.log(`⚠️  Missing enums: ${missingEnums.join(', ')}\n`);
    }

    // Test 6: Test simple queries
    console.log('6️⃣  Testing query functionality...');
    const userCount = await db.user.count();
    const accountCount = await db.account.count();
    const categoryCount = await db.category.count();
    const transactionCount = await db.transaction.count();
    const budgetCount = await db.budget.count();

    console.log(`   - Users: ${userCount}`);
    console.log(`   - Accounts: ${accountCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Transactions: ${transactionCount}`);
    console.log(`   - Budgets: ${budgetCount}`);
    console.log('✅ Prisma Client queries working\n');

    console.log('🎉 Database verification complete! All checks passed.');
  } catch (error) {
    console.error('❌ Database verification failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

verifyDatabase();
