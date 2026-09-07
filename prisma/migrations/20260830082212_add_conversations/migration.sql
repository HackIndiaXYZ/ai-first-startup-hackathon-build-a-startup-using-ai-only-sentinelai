-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- Create the initial development conversation
INSERT INTO "Conversation" (
    "id",
    "title",
    "createdAt",
    "updatedAt",
    "userId"
)
SELECT
    'dev-conversation',
    'Development Chat',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    "id"
FROM "User"
WHERE "email" = 'dev@sentinel.local';

-- Add conversationId as nullable temporarily
ALTER TABLE "AIMessage"
ADD COLUMN "conversationId" TEXT;

-- Attach existing messages to the development conversation
UPDATE "AIMessage"
SET "conversationId" = 'dev-conversation'
WHERE "userId" = (
    SELECT "id"
    FROM "User"
    WHERE "email" = 'dev@sentinel.local'
);

-- Make conversationId required
ALTER TABLE "AIMessage"
ALTER COLUMN "conversationId" SET NOT NULL;

-- Create indexes
CREATE INDEX "AIMessage_userId_idx" ON "AIMessage"("userId");
CREATE INDEX "AIMessage_conversationId_idx" ON "AIMessage"("conversationId");
CREATE INDEX "AIMessage_createdAt_idx" ON "AIMessage"("createdAt");

-- Add foreign keys
ALTER TABLE "Conversation"
ADD CONSTRAINT "Conversation_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "AIMessage"
ADD CONSTRAINT "AIMessage_conversationId_fkey"
FOREIGN KEY ("conversationId")
REFERENCES "Conversation"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
