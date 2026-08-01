"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem } from "@/types";

interface RiskDeleteDialogProps {
  risk: RiskItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (risk: RiskItem) => void;
}

export function RiskDeleteDialog({
  risk,
  onOpenChange,
  onConfirm,
}: RiskDeleteDialogProps) {
  const { dict } = useLocale();

  return (
    <Dialog open={Boolean(risk)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dict.riskRegister.deleteConfirmTitle.replace(
              "{title}",
              risk?.title ?? "",
            )}
          </DialogTitle>
          <p className="text-muted text-sm">
            {dict.riskRegister.deleteConfirmBody}
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (risk) onConfirm(risk);
            }}
          >
            {dict.common.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
