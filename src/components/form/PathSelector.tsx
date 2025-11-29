import { FormPath } from "@/types/form";
import { UserPlus, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathSelectorProps {
  selectedPath: FormPath;
  onSelectPath: (path: FormPath) => void;
}

export const PathSelector = ({ selectedPath, onSelectPath }: PathSelectorProps) => {
  return (
    <div className="form-section animate-fade-in">
      <h2 className="form-section-title">Vyberte typ případu</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelectPath('A')}
          className={cn(
            "relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 group",
            selectedPath === 'A'
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
            selectedPath === 'A' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
          )}>
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Nový pacient</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            První vyšetření pacienta s podezřením na sarkom
          </p>
          <ChevronRight className={cn(
            "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all",
            selectedPath === 'A' ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
          )} />
        </button>

        <button
          type="button"
          onClick={() => onSelectPath('B')}
          className={cn(
            "relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 group",
            selectedPath === 'B'
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
            selectedPath === 'B' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
          )}>
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Stávající pacient</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Konzultace nebo nový nález u stávajícího pacienta
          </p>
          <ChevronRight className={cn(
            "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all",
            selectedPath === 'B' ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
          )} />
        </button>
      </div>
    </div>
  );
};
