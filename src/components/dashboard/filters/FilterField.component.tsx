import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FilterFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export const FilterField = React.memo(({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder,
  className = "flex-1 min-w-[120px]",
}: FilterFieldProps) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label 
        htmlFor={id} 
        className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest px-1"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          id={id} 
          className="h-9 rounded-lg bg-background/80 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary cursor-pointer text-foreground text-xs"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-lg border-border/50 max-h-60">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value} 
              value={opt.value} 
              className="cursor-pointer text-xs"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
