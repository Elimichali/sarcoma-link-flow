import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, labels }: ProgressIndicatorProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          Krok {currentStep} z {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% dokončeno
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="hidden md:flex justify-between mt-4">
        {labels.map((label, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              index + 1 <= currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium",
              index + 1 < currentStep 
                ? "bg-primary text-primary-foreground" 
                : index + 1 === currentStep 
                  ? "bg-primary/20 text-primary border border-primary" 
                  : "bg-muted text-muted-foreground"
            )}>
              {index + 1 < currentStep ? <Check className="w-3 h-3" /> : index + 1}
            </div>
            <span className="hidden lg:inline">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
