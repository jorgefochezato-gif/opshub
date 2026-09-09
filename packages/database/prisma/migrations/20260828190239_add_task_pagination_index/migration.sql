-- CreateIndex
CREATE INDEX "Task_projectId_createdAt_id_idx" ON "Task"("projectId", "createdAt" DESC, "id" DESC);
