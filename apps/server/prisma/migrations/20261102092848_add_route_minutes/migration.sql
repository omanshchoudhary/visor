-- CreateTable
CREATE TABLE "RouteMinute" (
    "projectId" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "minute" TIMESTAMPTZ(3) NOT NULL,
    "requests" INTEGER NOT NULL,
    "clientErrors" INTEGER NOT NULL,
    "serverErrors" INTEGER NOT NULL,
    "durationSumUs" BIGINT NOT NULL,
    "durationMaxUs" INTEGER NOT NULL,
    "latency" INTEGER[],

    CONSTRAINT "RouteMinute_pkey" PRIMARY KEY ("projectId","route","method","minute")
);

-- CreateIndex
CREATE INDEX "RouteMinute_projectId_minute_idx" ON "RouteMinute"("projectId", "minute");

-- AddForeignKey
ALTER TABLE "RouteMinute" ADD CONSTRAINT "RouteMinute_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
