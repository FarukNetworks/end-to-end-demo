import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { CategoryList } from '@/components/categories/category-list';
import { AddCategoryButton } from '@/components/categories/add-category-button';

export const metadata = {
  title: 'Categories - BudgetBuddy',
};

export default async function CategoriesPage() {
  const user = await requireAuth();

  const categories = await db.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { txns: true } },
    },
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
          <AddCategoryButton />
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Expenses</h2>
            <CategoryList categories={expenseCategories} />
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Income</h2>
            <CategoryList categories={incomeCategories} />
          </div>
        </div>
      </div>
    </div>
  );
}
