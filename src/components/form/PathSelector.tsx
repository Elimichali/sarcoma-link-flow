import { FormPath } from "@/types/form";
import { UserPlus, ChevronRight, Search, TrendingUp, Users, Stethoscope, CheckCircle2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathSelectorProps {
  selectedPath: FormPath;
  onSelectPath: (path: FormPath) => void;
}

export const PathSelector = ({ selectedPath, onSelectPath }: PathSelectorProps) => {
  return (
    <div className="form-section animate-fade-in flex flex-col justify-center min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Kdy formulář použít</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Formulář použijte pro rychlé a odborné posouzení možného sarkomu — i při malém podezření je bezpečnější případ předat specialistům.
        </p>
      </div>

      {/* 3 Use Cases - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50 border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            <strong>Nová bulka nebo léze</strong> s podezřením na sarkom
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50 border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            Nález se <strong>zvětšuje nebo mění</strong> a budí obavy
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50 border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            Potřebujete <strong>konzultaci</strong> nebo <strong>druhý názor</strong>
          </p>
        </div>
      </div>

      {/* Requirements Note */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border mb-5 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 justify-center">
          <Stethoscope className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Potřeba: <strong className="text-foreground">základní anamnéza</strong> + <strong className="text-foreground">zobrazovací vyšetření</strong> (min. sono, ideálně MRI/CT)
          </p>
        </div>
      </div>

      {/* 3 Benefits with Checkmarks - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="flex flex-col items-center text-center p-3 rounded-lg border border-success/30 bg-success/5">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-xs text-foreground">Formulář Vás provede všemi kroky</p>
        </div>
        
        <div className="flex flex-col items-center text-center p-3 rounded-lg border border-success/30 bg-success/5">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-xs text-foreground">Raději odeslat dříve než pozdě</p>
        </div>
        
        <div className="flex flex-col items-center text-center p-3 rounded-lg border border-success/30 bg-success/5">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-xs text-foreground">Tým zajistí triáž a další postup</p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center mb-4">
        <ArrowDown className="w-5 h-5 text-primary animate-bounce" />
      </div>

      {/* Form Start Button */}
      <div className="max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={() => onSelectPath('A')}
          className={cn(
            "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group",
            selectedPath === 'A'
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              selectedPath === 'A' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
            )}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Vyplnit formulář</h3>
              <p className="text-xs text-muted-foreground">Nový pacient s podezřením na sarkom</p>
            </div>
          </div>
          <ChevronRight className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all",
            selectedPath === 'A' ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
          )} />
        </button>
      </div>
    </div>
  );
};
