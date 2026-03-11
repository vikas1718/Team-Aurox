
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  hour: string;
  items: {
    id: string;
    title: string;
    platform: string;
    color: string;
  }[];
}

// Generate time slots based on current date
const generateTimeSlots = (date: Date) => {
  const today = date.toISOString().split("T")[0];
  
  return [
    { hour: "08:00", items: [
      { id: "1", title: "Morning Brief", platform: "Radio", color: "bg-green-500" }
    ]},
    { hour: "09:00", items: [
      { id: "2", title: "Market Open", platform: "Web", color: "bg-blue-500" },
      { id: "3", title: "Daily Digest", platform: "e-Paper", color: "bg-purple-500" }
    ]},
    { hour: "10:00", items: [] },
    { hour: "11:00", items: [
      { id: "4", title: "Breaking News", platform: "All", color: "bg-primary" }
    ]},
    { hour: "12:00", items: [
      { id: "5", title: "Noon Update", platform: "App", color: "bg-cyan-500" }
    ]},
    { hour: "13:00", items: [] },
    { hour: "14:00", items: [
      { id: "6", title: "Analysis", platform: "Podcast", color: "bg-amber-500" }
    ]},
    { hour: "15:00", items: [
      { id: "7", title: "Social Post", platform: "Social", color: "bg-pink-500" }
    ]},
  ];
};

export const PublicationTimeline = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const timeSlots = generateTimeSlots(currentDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate current hour position for the indicator
  const getCurrentHourPosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Start from 8:00 (index 0) and calculate position
    const totalMinutes = (hours - 8) * 60 + minutes;
    const maxMinutes = 16 * 60; // 8 hours * 60 minutes
    return Math.max(0, Math.min((totalMinutes / maxMinutes) * 100, 100));
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Today's Schedule</h2>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
            onClick={() => navigateDay(-1)}
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            className="text-sm font-medium text-foreground px-3 hover:text-primary transition-colors cursor-pointer"
            onClick={goToToday}
            title="Go to today"
          >
            {formatDate(currentDate)}
          </button>
          <button 
            className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
            onClick={() => navigateDay(1)}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Time grid */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {timeSlots.map((slot, index) => (
            <div 
              key={slot.hour} 
              className={cn(
                "flex-shrink-0 w-32",
                "opacity-0 animate-fade-in",
                `stagger-${Math.min(index + 1, 6)}`
              )}
            >
              <div className="text-xs font-medium text-muted-foreground mb-3">{slot.hour}</div>
              <div className="min-h-[100px] rounded-lg bg-secondary/30 border border-dashed border-border p-2 space-y-2">
                {slot.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    <div className={cn("w-2 h-2 rounded-full mb-2", item.color)} />
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.platform}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current time indicator - only show if viewing today */}
        {isToday && (
          <div 
            className="absolute top-0 bottom-4 w-0.5 bg-primary z-10"
            style={{ left: `${getCurrentHourPosition()}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

