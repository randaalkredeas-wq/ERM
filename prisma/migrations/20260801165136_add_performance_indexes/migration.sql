-- CreateIndex
CREATE INDEX "Approval_submittedAt_idx" ON "Approval"("submittedAt");

-- CreateIndex
CREATE INDEX "Document_updatedAt_idx" ON "Document"("updatedAt");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt");

-- CreateIndex
CREATE INDEX "KriIndicator_createdAt_idx" ON "KriIndicator"("createdAt");

-- CreateIndex
CREATE INDEX "Risk_createdAt_idx" ON "Risk"("createdAt");

-- CreateIndex
CREATE INDEX "Risk_nextReviewDate_idx" ON "Risk"("nextReviewDate");
