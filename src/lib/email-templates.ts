import "server-only";

function appUrl(path: string): string {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

function renderEmail(title: string, body: string, ctaLabel: string, ctaUrl: string) {
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="margin: 0 0 12px;">${title}</h2>
      <p style="margin: 0 0 20px; line-height: 1.5; color: #444;">${body}</p>
      <a href="${ctaUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">${ctaLabel}</a>
      <p style="margin-top: 32px; font-size: 12px; color: #999;">Enterprise Risk Management Platform</p>
    </div>
  `.trim();
  const text = `${title}\n\n${body}\n\n${ctaLabel}: ${ctaUrl}`;
  return { html, text };
}

export function riskAssignedEmail(riskCode: string, riskTitle: string) {
  const { html, text } = renderEmail(
    "A risk has been assigned to you",
    `${riskCode} — "${riskTitle}" has been assigned to you in the Risk Register.`,
    "View risk",
    appUrl(`/risk-register/${riskCode}`),
  );
  return { subject: `[ERM] Risk assigned: ${riskCode}`, html, text };
}

export function approvalRequestEmail(riskCode: string, riskTitle: string) {
  const { html, text } = renderEmail(
    "Approval requested",
    `${riskCode} — "${riskTitle}" was submitted for review and needs a decision.`,
    "Review risk",
    appUrl(`/risk-register/${riskCode}`),
  );
  return { subject: `[ERM] Approval requested: ${riskCode}`, html, text };
}

export function approvalDecisionEmail(
  riskCode: string,
  riskTitle: string,
  decision: "approved" | "rejected",
) {
  const { html, text } = renderEmail(
    decision === "approved" ? "Risk approved" : "Risk rejected",
    `${riskCode} — "${riskTitle}" was ${decision}.`,
    "View risk",
    appUrl(`/risk-register/${riskCode}`),
  );
  return { subject: `[ERM] Risk ${decision}: ${riskCode}`, html, text };
}

export function overdueTreatmentEmail(
  riskCode: string,
  riskTitle: string,
  actionTitle: string,
  dueDate: string,
) {
  const { html, text } = renderEmail(
    "Treatment action overdue",
    `"${actionTitle}" on ${riskCode} — "${riskTitle}" was due ${dueDate} and is now overdue.`,
    "View treatment plan",
    appUrl(`/risk-register/${riskCode}`),
  );
  return { subject: `[ERM] Overdue treatment action: ${riskCode}`, html, text };
}

export function upcomingReviewEmail(
  riskCode: string,
  riskTitle: string,
  nextReviewDate: string,
) {
  const { html, text } = renderEmail(
    "Risk review coming up",
    `${riskCode} — "${riskTitle}" is due for review on ${nextReviewDate}.`,
    "View risk",
    appUrl(`/risk-register/${riskCode}`),
  );
  return { subject: `[ERM] Upcoming review: ${riskCode}`, html, text };
}

export function riskClosedEmail(riskCode: string, riskTitle: string) {
  const { html, text } = renderEmail(
    "Risk closed",
    `${riskCode} — "${riskTitle}" has been closed.`,
    "View risk",
    appUrl(`/risk-register/${riskCode}`),
  );
  return { subject: `[ERM] Risk closed: ${riskCode}`, html, text };
}
