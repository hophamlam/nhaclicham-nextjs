"use client";

import { useState } from "react";
import { type Reminder } from "@/types/reminder";
import { EventCard } from "./EventCard";
import { Button } from "./ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventsListProps {
  events: Reminder[];
  onEdit?: (event: Reminder) => void;
  onDelete?: (event: Reminder) => void;
}

export function EventsList({ events, onEdit, onDelete }: EventsListProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("grid")}
            className={cn(
              "px-3 py-1 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
              view === "grid" &&
                "bg-white dark:bg-gray-700 shadow text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("list")}
            className={cn(
              "px-3 py-1 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
              view === "list" &&
                "bg-white dark:bg-gray-700 shadow text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            view={view}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
