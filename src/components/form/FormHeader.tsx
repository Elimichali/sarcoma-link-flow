import { FileText, Shield } from "lucide-react";

export const FormHeader = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Referenční formulář – Sarkom
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Předání pacienta s podezřením na sarkom koordinátorovi onkologické péče
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>Zabezpečený formulář • Data jsou šifrována a zpracovávána v souladu s GDPR</span>
        </div>
      </div>
    </header>
  );
};
