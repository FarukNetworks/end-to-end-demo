'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date) => void;
  presets?: Array<'today' | 'yesterday' | '2-days-ago'>;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  presets = [],
  placeholder = 'Pick a date',
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handlePresetClick = (preset: 'today' | 'yesterday' | '2-days-ago') => {
    const now = new Date();
    let selectedDate: Date;

    switch (preset) {
      case 'today':
        selectedDate = now;
        break;
      case 'yesterday':
        selectedDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case '2-days-ago':
        selectedDate = new Date(now.setDate(now.getDate() - 2));
        break;
      default:
        selectedDate = now;
    }

    onDateChange(selectedDate);
    setOpen(false);
  };

  const presetLabels: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    '2-days-ago': '2 Days Ago',
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {presets.length > 0 && (
            <div className="flex gap-2 border-b p-3">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="flex-1"
                >
                  {presetLabels[preset]}
                </Button>
              ))}
            </div>
          )}
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                onDateChange(selectedDate);
                setOpen(false);
              }
            }}
            disabled={{ after: new Date() }}
            initialFocus
            className="p-3"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
