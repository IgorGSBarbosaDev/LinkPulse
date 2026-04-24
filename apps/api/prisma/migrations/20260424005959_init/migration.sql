-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_links" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "customAlias" TEXT,
    "title" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "maxClicks" INTEGER,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_access_events" (
    "id" UUID NOT NULL,
    "shortLinkId" UUID NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,

    CONSTRAINT "link_access_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "short_links_shortCode_key" ON "short_links"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "short_links_customAlias_key" ON "short_links"("customAlias");

-- CreateIndex
CREATE INDEX "short_links_userId_deletedAt_idx" ON "short_links"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "short_links_userId_createdAt_idx" ON "short_links"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "short_links_createdAt_idx" ON "short_links"("createdAt");

-- CreateIndex
CREATE INDEX "link_access_events_shortLinkId_accessedAt_idx" ON "link_access_events"("shortLinkId", "accessedAt");

-- CreateIndex
CREATE INDEX "link_access_events_accessedAt_idx" ON "link_access_events"("accessedAt");

-- AddForeignKey
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_access_events" ADD CONSTRAINT "link_access_events_shortLinkId_fkey" FOREIGN KEY ("shortLinkId") REFERENCES "short_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
