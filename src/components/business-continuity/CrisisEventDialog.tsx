"use client";

import { useState } from "react";

import { useBusinessContinuity } from "@/app/(app)/business-continuity/business-continuity-context";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RISK_OWNERS } from "@/constants/risk-register";
import { useLocale } from "@/providers/locale-provider";

interface CrisisEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrisisEventDialog({ open, onOpenChange }: CrisisEventDialogProps) {
  const { dict } = useLocale();
  const { processes, logCrisisEvent } = useBusinessContinuity();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [affectedProcesses, setAffectedProcesses] = useState<string[]>([]);
  const [responseTeam, setResponseTeam] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const isValid = title.trim().length > 2 && description.trim().length > 2;

  function reset() {
    setTitle("");
    setDescription("");
    setAffectedProcesses([]);
    setResponseTeam([]);
    setTouched(false);
  }

  function toggleProcess(id: string) {
    setAffectedProcesses((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function toggleMember(name: string) {
    setResponseTeam((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    logCrisisEvent({ title, description, affectedProcesses, responseTeam });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dict.businessContinuity.logCrisisEvent}</DialogTitle>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.businessContinuity.columns.title}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={dict.businessContinuity.crisisTitlePlaceholder}
            />
            {touched && title.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.controlsLibrary.description}
            </label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict.businessContinuity.crisisDescriptionPlaceholder}
            />
            {touched && description.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.businessContinuity.affectedProcesses}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {processes.map((p) => (
                <button key={p.id} type="button" onClick={() => toggleProcess(p.id)}>
                  <Badge tone={affectedProcesses.includes(p.id) ? "primary" : "neutral"}>
                    {p.name}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.businessContinuity.responseTeam}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RISK_OWNERS.map((o) => (
                <button key={o} type="button" onClick={() => toggleMember(o)}>
                  <Badge tone={responseTeam.includes(o) ? "primary" : "neutral"}>{o}</Badge>
                </button>
              ))}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button variant="danger" onClick={handleSubmit}>
            {dict.businessContinuity.logCrisisEvent}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
