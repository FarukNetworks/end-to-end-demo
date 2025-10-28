'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryDialog } from './category-dialog';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useRouter } from 'next/navigation';
import type { Category } from '@prisma/client';

type CategoryWithCount = Category & {
  _count: { txns: number };
};

interface CategoryListProps {
  categories: CategoryWithCount[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setEditDialogOpen(true);
  };

  const handleDelete = (category: CategoryWithCount) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    // Refresh the page data
    router.refresh();
  };

  if (categories.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No categories yet</p>
      </Card>
    );
  }

  return (
    <>
      {isMobile ? (
        // Mobile card layout
        <div className="space-y-2">
          {categories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{category.name}</p>
                      {category.isSystem && (
                        <Shield className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category._count.txns}{' '}
                      {category._count.txns === 1 ? 'transaction' : 'transactions'}
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category)}
                    disabled={category.isSystem}
                    aria-label={`Delete ${category.name}`}
                    title={
                      category.isSystem ? 'System categories cannot be deleted' : 'Delete category'
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop table layout
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-12 p-4 text-left font-medium"></th>
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Transactions</th>
                  <th className="w-32 p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="p-4">
                      <span
                        className="block h-4 w-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {category.isSystem && (
                          <Shield
                            className="h-4 w-4 text-muted-foreground"
                            aria-label="System category"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {category._count.txns}{' '}
                      {category._count.txns === 1 ? 'transaction' : 'transactions'}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          disabled={category.isSystem}
                          aria-label={`Delete ${category.name}`}
                          title={
                            category.isSystem
                              ? 'System categories cannot be deleted'
                              : 'Delete category'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editingCategory && (
        <CategoryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          category={editingCategory}
          mode="edit"
          onSuccess={handleSuccess}
        />
      )}

      {deletingCategory && (
        <DeleteCategoryDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          category={deletingCategory}
          availableCategories={categories}
          onDeleted={handleSuccess}
        />
      )}
    </>
  );
}
