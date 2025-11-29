import { useState } from "react";
import { FormPath } from "@/types/form";
import { FormHeader } from "./FormHeader";
import { PathSelector } from "./PathSelector";
import { FormPathA } from "./FormPathA";
import { FormPathB } from "./FormPathB";

export const SarcomaReferralForm = () => {
  const [selectedPath, setSelectedPath] = useState<FormPath>(null);

  const handleBack = () => {
    setSelectedPath(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <FormHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!selectedPath && (
          <PathSelector
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
          />
        )}

        {selectedPath === 'A' && <FormPathA onBack={handleBack} />}
        {selectedPath === 'B' && <FormPathB onBack={handleBack} />}
      </main>

      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Referenční formulář – Sarkom. Všechna práva vyhrazena.</p>
          <p className="mt-1">Pro technickou podporu kontaktujte správce systému.</p>
        </div>
      </footer>
    </div>
  );
};
