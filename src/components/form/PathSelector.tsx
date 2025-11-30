import { FormPath } from "@/types/form";
import {
  Search,
  TrendingUp,
  Users,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Mail,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SarcomaRibbon } from "@/components/SarcomaRibbon";

interface PathSelectorProps {
  selectedPath: FormPath;
  onSelectPath: (path: FormPath) => void;
}

export const PathSelector = ({ onSelectPath }: PathSelectorProps) => {
  return (
    <div className="animate-fade-in flex flex-col min-h-[calc(100vh-180px)]">
      {/* Hero Section - Above the Fold */}
      <section className="relative py-8 px-4 -mx-4 bg-gradient-to-br from-sarcoma/30 via-sarcoma/10 to-accent border-b border-sarcoma/30">
        {/* Login Button - Top Right */}
        <button className="absolute top-4 right-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Přihlášení</span>
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Left: Title & Description */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <SarcomaRibbon size="sm" />
                <span className="text-xs font-medium text-sarcoma-dark bg-sarcoma/20 px-2.5 py-1 rounded-full">
                  Sarkom Awareness
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Nový pacient s podezřením na sarkom
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Předejte případ specializovanému týmu — rychle, bezpečně a jednoduše.
              </p>
            </div>

            {/* Right: CTA */}
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={() => onSelectPath("A")}
                size="lg"
                className="bg-primary hover:bg-sarcoma-dark text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Vyplnit formulář
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <span className="text-xs text-muted-foreground">Odeslání trvá ~5 minut</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="flex justify-center py-3">
        <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
      </div>

      {/* Main Content */}
      <div className="flex-1 py-4">
        {/* When to Use - 3 Horizontal Cards */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">
            Kdy formulář použít
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group flex flex-col items-center text-center p-5 rounded-xl bg-sarcoma/10 border border-sarcoma/30 hover:border-sarcoma hover:shadow-md hover:bg-sarcoma/20 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-sarcoma/30 flex items-center justify-center mb-3 group-hover:bg-sarcoma/50 transition-colors">
                <Search className="w-6 h-6 text-sarcoma-dark" />
              </div>
              <p className="text-sm text-foreground">
                <strong>Nová bulka nebo léze</strong> vzbuzující podezření
              </p>
            </div>

            <div className="group flex flex-col items-center text-center p-5 rounded-xl bg-sarcoma/10 border border-sarcoma/30 hover:border-sarcoma hover:shadow-md hover:bg-sarcoma/20 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-sarcoma/30 flex items-center justify-center mb-3 group-hover:bg-sarcoma/50 transition-colors">
                <TrendingUp className="w-6 h-6 text-sarcoma-dark" />
              </div>
              <p className="text-sm text-foreground">
                Nález se <strong>zvětšuje nebo mění</strong>
              </p>
            </div>

            <div className="group flex flex-col items-center text-center p-5 rounded-xl bg-sarcoma/10 border border-sarcoma/30 hover:border-sarcoma hover:shadow-md hover:bg-sarcoma/20 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-sarcoma/30 flex items-center justify-center mb-3 group-hover:bg-sarcoma/50 transition-colors">
                <Users className="w-6 h-6 text-sarcoma-dark" />
              </div>
              <p className="text-sm text-foreground">
                Potřebujete <strong>konzultaci</strong> nebo <strong>druhý názor</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Requirements Note */}
        <section className="mb-6">
          <div className="flex items-center gap-3 justify-center p-4 rounded-xl bg-sarcoma/5 border border-sarcoma/20 max-w-2xl mx-auto">
            <Stethoscope className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Minimální potřeba:</strong> základní anamnéza + zobrazovací vyšetření
              (sono, ideálně MRI/CT)
            </p>
          </div>
        </section>

        {/* Benefits - 3 Check Cards */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">
            Co můžete očekávat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-success/30 bg-success/5">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-foreground">Formulář vás provede všemi kroky</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-success/30 bg-success/5">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-foreground">Doporučujeme odeslat co nejdříve</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-success/30 bg-success/5">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-foreground">Tým zajistí triáž a další postup</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
