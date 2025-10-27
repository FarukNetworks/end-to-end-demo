import { db } from '@/lib/db';
import { Prisma, TxnType } from '@prisma/client';

export interface TransactionFilters {
  from?: Date;
  to?: Date;
  categoryId?: string;
  accountId?: string;
  type?: TxnType;
  search?: string;
}

export async function getTransactions(
  userId: string,
  filters?: TransactionFilters,
  options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }
) {
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(filters?.from && { txnDate: { gte: filters.from } }),
    ...(filters?.to && { txnDate: { lte: filters.to } }),
    ...(filters?.categoryId && { categoryId: filters.categoryId }),
    ...(filters?.accountId && { accountId: filters.accountId }),
    ...(filters?.type && { type: filters.type }),
    ...(filters?.search && {
      note: { contains: filters.search, mode: 'insensitive' },
    }),
  };

  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        category: {
          select: { name: true, color: true, type: true },
        },
        account: {
          select: { name: true },
        },
      },
      orderBy: options?.orderBy || { txnDate: 'desc' },
      skip: options?.skip,
      take: options?.take,
    }),
    db.transaction.count({ where }),
  ]);

  return { transactions, total };
}

export async function getTransaction(userId: string, id: string) {
  return db.transaction.findFirst({
    where: { id, userId },
    include: {
      category: true,
      account: true,
    },
  });
}

export async function createTransaction(
  userId: string,
  data: Omit<Prisma.TransactionCreateInput, 'user' | 'category' | 'account'> & {
    categoryId: string;
    accountId: string;
  }
) {
  const { categoryId, accountId, ...transactionData } = data;
  return db.transaction.create({
    data: {
      ...transactionData,
      user: { connect: { id: userId } },
      category: { connect: { id: categoryId } },
      account: { connect: { id: accountId } },
    },
    include: {
      category: { select: { name: true, color: true } },
      account: { select: { name: true } },
    },
  });
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: {
    amount?: number;
    type?: TxnType;
    txnDate?: Date;
    categoryId?: string;
    accountId?: string;
    note?: string | null;
    tags?: string[];
  }
) {
  const { categoryId, accountId, ...otherData } = data;

  // Build update data with proper relation syntax
  const updateData: Prisma.TransactionUpdateInput = {
    ...otherData,
    ...(categoryId && { category: { connect: { id: categoryId } } }),
    ...(accountId && { account: { connect: { id: accountId } } }),
  };

  // Use updateMany to ensure userId check
  const result = await db.transaction.updateMany({
    where: { id, userId },
    data: updateData,
  });

  if (result.count === 0) {
    return null;
  }

  return getTransaction(userId, id);
}

export async function deleteTransaction(userId: string, id: string) {
  const result = await db.transaction.deleteMany({
    where: { id, userId },
  });

  return result.count > 0;
}

export async function bulkReassignCategory(
  userId: string,
  transactionIds: string[],
  newCategoryId: string
) {
  const result = await db.transaction.updateMany({
    where: {
      id: { in: transactionIds },
      userId,
    },
    data: {
      categoryId: newCategoryId,
    },
  });

  return result.count;
}

export async function bulkDeleteTransactions(userId: string, transactionIds: string[]) {
  const result = await db.transaction.deleteMany({
    where: {
      id: { in: transactionIds },
      userId,
    },
  });

  return result.count;
}
