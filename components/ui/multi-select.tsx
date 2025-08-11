"use client";

import * as React from "react";
import { X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSelected?: number;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Select filters...",
      disabled = false,
      className,
      maxSelected,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    const selectedOptions = options.filter((option) =>
      value.includes(option.value)
    );
    const availableOptions = options.filter(
      (option) => !value.includes(option.value)
    );

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      if (maxSelected && value.length >= maxSelected) return;

      const newValue = [...value, optionValue];
      onValueChange(newValue);
      setSearchValue("");
    };

    const handleRemove = (optionValue: string) => {
      if (disabled) return;
      const newValue = value.filter((v) => v !== optionValue);
      onValueChange(newValue);
    };

    const filteredOptions = searchValue
      ? availableOptions.filter(
          (option) =>
            option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
            option.value.toLowerCase().includes(searchValue.toLowerCase())
        )
      : availableOptions;

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between min-h-[42px] h-auto p-1 border-input bg-background hover:bg-background hover:text-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {selectedOptions.length > 0 ? (
                  selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      {option.label}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(option.value);
                        }}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5 transition-colors"
                        disabled={disabled}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    {placeholder}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search filters..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="border-0 focus:ring-0"
              />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>No filters found.</CommandEmpty>
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
