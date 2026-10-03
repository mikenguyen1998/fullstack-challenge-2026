import { ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

export interface TokenOption {
  value: string;
  label: ReactNode;
}

interface TokenSelectProps {
  label: string;
  options: TokenOption[];
  value: string | null;
  onChange: (value: string) => void;
  onMenuClose?: () => void;
  isClearable?: boolean;
  isSearchable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

/** Searchable token picker (shadcn Popover + Command). Replaces the old react-select `SelectInput`. */
export function TokenSelect({
  label,
  options,
  value,
  onChange,
  onMenuClose,
  isClearable,
  isSearchable,
  disabled,
  placeholder = 'Select...',
  error,
}: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) || null;
  const uuid = useId();
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onMenuClose?.();
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm font-medium text-slate-900 dark:text-slate-100" id={uuid}>
        {label}
      </label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <div className="relative">
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-labelledby={uuid}
              disabled={disabled}
              className={cn(
                'flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left transition outline-none dark:border-slate-700 dark:bg-slate-900',
                'focus-visible:border-brand-500 focus-visible:ring-brand-500/30 focus-visible:ring-2',
                open && 'border-brand-500 ring-brand-500/30 ring-2',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {selected ? selected.label : <span className="text-slate-400">{placeholder}</span>}
              <ChevronsUpDownIcon className="size-4 shrink-0 text-slate-400" />
            </button>
          </PopoverTrigger>
          {isClearable && selected && !disabled && (
            <button
              type="button"
              aria-label="Clear selection"
              onClick={() => {
                onChange('');
              }}
              className="absolute top-1/2 right-9 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            {isSearchable && <CommandInput placeholder="Search..." />}
            <CommandList>
              <CommandEmpty>No options</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    data-checked={option.value === value}
                    onSelect={() => {
                      onChange(option.value);
                      handleOpenChange(false);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
