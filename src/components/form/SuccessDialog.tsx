import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { DestinationType, DESTINATION_OPTIONS } from "@/types/form";

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  destination: DestinationType;
}

export const SuccessDialog = ({ open, onClose, destination }: SuccessDialogProps) => {
  const destinationInfo = DESTINATION_OPTIONS.find(d => d.value === destination);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <DialogTitle className="text-xl text-center">Formulář byl úspěšně odeslán</DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <p className="text-base font-medium text-foreground">
              Děkujeme moc za vyplnění a pomoc při včasné diagnóze.
            </p>
            <p className="text-base">
              Vaše odpověď byla zaznamenána a odeslána na{" "}
              <span className="font-semibold text-foreground">{destinationInfo?.displayName}</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              Vaším podnětem se budeme zabývat jen jak to bude možné v rámci našich ordinačních hodin – PO a PÁ 9–12 hod.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button onClick={onClose}>Zavřít</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
