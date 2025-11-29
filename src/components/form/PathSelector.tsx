import { FormPath } from "@/types/form";
import { UserPlus, ChevronRight, AlertCircle, Search, Users, Stethoscope, ArrowDown, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathSelectorProps {
  selectedPath: FormPath;
  onSelectPath: (path: FormPath) => void;
}

export const PathSelector = ({ selectedPath, onSelectPath }: PathSelectorProps) => {
  return (
    <div className="form-section animate-fade-in">
      {/* Info Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Kdy formulář použít</h2>
        </div>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Formulář použijte, když chcete zajistit rychlé a odborné posouzení možného sarkomu — i při malém podezření je bezpečnější případ předat ke specialistům:
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-foreground">
              Když se objeví <strong>bulka nebo nová léze</strong> a je podezření na sarkom měkkých tkání
            </p>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-foreground">
              Když se nález <strong>zvětšuje, mění</strong> nebo jinak budí obavy
            </p>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-foreground">
              Když potřebujete <strong>konzultaci</strong> existujícího pacienta nebo <strong>druhý názor</strong> na možný sarkom
            </p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50 border border-border mb-6">
          <div className="flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Pro správné posouzení je potřeba mít <strong className="text-foreground">základní anamnézu</strong> a vhodné <strong className="text-foreground">zobrazovací vyšetření</strong> (minimálně sonografie, ideálně MRI nebo CT podle lokalizace).
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Formulář Vás jednoduše provede všemi potřebnými kroky.
        </p>
        
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Clock className="w-4 h-4" />
            <span>Raději odeslat dříve než pozdě.</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Specializovaný tým zajistí triáž a doporučí další postup.</span>
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <ArrowDown className="w-6 h-6 text-primary animate-bounce" />
        </div>
      </div>

      {/* Form Start Button */}
      <h2 className="form-section-title">Začít vyplňování formuláře</h2>
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onSelectPath('A')}
          className={cn(
            "relative w-full p-5 rounded-xl border-2 text-left transition-all duration-200 group",
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
          <h3 className="font-semibold text-foreground mb-1 text-base">Nový pacient</h3>
          <p className="text-sm text-muted-foreground">
            Vyšetření pacienta s podezřením na sarkom
          </p>
          <ChevronRight className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all",
            selectedPath === 'A' ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
          )} />
        </button>
      </div>
    </div>
  );
};