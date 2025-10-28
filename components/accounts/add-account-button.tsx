'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AccountDialog } from './account-dialog';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AddAccountButton() {
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
        Add Account
      </Button>

      <AccountDialog open={open} onOpenChange={setOpen} mode="create" onSuccess={handleSuccess} />
    </>
  );
}
