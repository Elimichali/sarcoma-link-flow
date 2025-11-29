import { Shield } from "lucide-react";
import { SarcomaRibbon } from "@/components/SarcomaRibbon";

export const FormHeader = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="flex items-center gap-4">
          <SarcomaRibbon size="md" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Referenční formulář – Sarkom
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Rychlé předání pacienta se suspekcí na sarkom specializovanému týmu
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>Zabezpečený formulář • Data jsou šifrována a zpracovávána v souladu s GDPR</span>
        </div>
      </div>
    </header>
  );
};
