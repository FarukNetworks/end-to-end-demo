'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CategoryDialog } from './category-dialog';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AddCategoryButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    // Refresh the page data
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Category
      </Button>

      <CategoryDialog open={open} onOpenChange={setOpen} mode="create" onSuccess={handleSuccess} />
    </>
  );
}
