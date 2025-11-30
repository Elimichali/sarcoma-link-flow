import { useState } from "react";
import { FormPath } from "@/types/form";
import { PathSelector } from "./PathSelector";
import { FormPathA } from "./FormPathA";

export const SarcomaReferralForm = () => {
  const [selectedPath, setSelectedPath] = useState<FormPath>(null);

  const handleBack = () => {
    setSelectedPath(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!selectedPath && <PathSelector selectedPath={selectedPath} onSelectPath={setSelectedPath} />}

        {selectedPath === "A" && <FormPathA onBack={handleBack} />}
      </main>

      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Sarkom FastTrack. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  );
};
