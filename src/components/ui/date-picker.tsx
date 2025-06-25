"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // ISO date string or empty
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Component DatePicker cho dương lịch với UI đẹp
 * Sử dụng Popover + Calendar để người dùng chọn ngày dễ dàng
 */
export function DatePicker({
  value = "",
  onChange,
  placeholder = "Chọn ngày",
  disabled = false,
  className,
}: DatePickerProps) {
  // Convert string value to Date object
  const selectedDate = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined;
  const isValidDate = selectedDate && isValid(selectedDate);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Convert to ISO date string (yyyy-MM-dd format)
      const isoString = format(date, "yyyy-MM-dd");
      onChange(isoString);
    } else {
      onChange("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !isValidDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isValidDate ? (
            format(selectedDate, "dd/MM/yyyy", { locale: vi })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? selectedDate : undefined}
          onSelect={handleSelect}
          initialFocus
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  );
}
