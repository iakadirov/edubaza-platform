-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'SCHOOL');
CREATE TYPE "WorksheetStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED');
CREATE TYPE "PaymentMethod" AS ENUM ('CLICK', 'PAYME', 'UZCARD', 'HUMO');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(255),
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscriptionExpiresAt" TIMESTAMP(3),
    "subscriptionStartedAt" TIMESTAMP(3),
    "limits" JSONB NOT NULL DEFAULT '{"worksheetsPerMonth": 10, "templatesAccess": 3, "taskTypesAccess": 15}',
    "usage" JSONB NOT NULL DEFAULT '{"worksheetsThisMonth": 0, "lastResetAt": null}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worksheets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" VARCHAR(50) NOT NULL,
    "grade" INTEGER NOT NULL,
    "topicUz" TEXT NOT NULL,
    "topicRu" TEXT,
    "config" JSONB NOT NULL,
    "tasks" JSONB NOT NULL,
    "templateId" TEXT,
    "pdfUrl" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "status" "WorksheetStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "worksheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "nameUz" VARCHAR(100) NOT NULL,
    "nameRu" VARCHAR(100),
    "description" TEXT,
    "previewUrl" TEXT NOT NULL,
    "htmlTemplate" TEXT NOT NULL,
    "cssStyles" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "category" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_topics" (
    "id" TEXT NOT NULL,
    "subject" VARCHAR(50) NOT NULL,
    "grade" INTEGER NOT NULL,
    "topicUz" TEXT NOT NULL,
    "topicRu" TEXT,
    "description" TEXT,
    "keywords" TEXT[],
    "quarter" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'UZS',
    "planType" "SubscriptionPlan" NOT NULL,
    "durationMonths" INTEGER NOT NULL DEFAULT 1,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "transactionId" VARCHAR(255),
    "paymentData" JSONB,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_phone_idx" ON "users"("phone");
CREATE INDEX "users_subscriptionPlan_idx" ON "users"("subscriptionPlan");

-- CreateIndex
CREATE INDEX "worksheets_userId_idx" ON "worksheets"("userId");
CREATE INDEX "worksheets_subject_idx" ON "worksheets"("subject");
CREATE INDEX "worksheets_grade_idx" ON "worksheets"("grade");
CREATE INDEX "worksheets_generatedAt_idx" ON "worksheets"("generatedAt");

-- CreateIndex
CREATE INDEX "templates_isPremium_idx" ON "templates"("isPremium");
CREATE INDEX "templates_isActive_idx" ON "templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_topics_subject_grade_topicUz_key" ON "curriculum_topics"("subject", "grade", "topicUz");
CREATE INDEX "curriculum_topics_subject_grade_idx" ON "curriculum_topics"("subject", "grade");
CREATE INDEX "curriculum_topics_keywords_idx" ON "curriculum_topics"("keywords");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");
CREATE INDEX "payments_userId_idx" ON "payments"("userId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "system_logs_level_idx" ON "system_logs"("level");
CREATE INDEX "system_logs_module_idx" ON "system_logs"("module");
CREATE INDEX "system_logs_createdAt_idx" ON "system_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "worksheets" ADD CONSTRAINT "worksheets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "worksheets" ADD CONSTRAINT "worksheets_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
