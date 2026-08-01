"use client";

import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem } from "@/types";

export function RiskCommentsTab({ risk }: { risk: RiskItem }) {
  const { dict } = useLocale();
  const { addComment } = useRiskRegister();
  const [message, setMessage] = useState("");

  function handlePost() {
    if (!message.trim()) return;
    addComment(risk.id, message);
    setMessage("");
  }

  return (
    <Card>
      {risk.comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={dict.riskDetail.comments.empty}
          description={dict.riskDetail.comments.emptyHint}
        />
      ) : (
        <div className="space-y-4">
          {risk.comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback>{comment.authorInitials}</AvatarFallback>
              </Avatar>
              <div className="border-border min-w-0 flex-1 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground text-sm font-semibold">
                    {comment.author}
                  </p>
                  <p className="text-muted shrink-0 text-xs">
                    {formatDate(comment.createdAt, dict.meta.locale)}
                  </p>
                </div>
                <p className="text-muted mt-1 text-sm">{comment.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-border mt-5 flex items-start gap-3 border-t pt-5">
        <Textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={dict.riskDetail.comments.placeholder}
          className="flex-1"
        />
        <Button onClick={handlePost} disabled={!message.trim()}>
          <Send className="h-4 w-4" />
          {dict.riskDetail.comments.post}
        </Button>
      </div>
    </Card>
  );
}
