-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('DIESEL', 'ALT_FUEL');

-- CreateEnum
CREATE TYPE "TruckStatus" AS ENUM ('COMPLIANT', 'DUE_SOON', 'OVERDUE');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "TestingSchedule" AS ENUM ('SEMI_ANNUAL', 'QUARTERLY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "phone" TEXT,
    "default_reminder_days" INTEGER[] DEFAULT ARRAY[30, 14, 3]::INTEGER[],
    "testing_schedule" "TestingSchedule" NOT NULL DEFAULT 'SEMI_ANNUAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trucks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "engine_year" INTEGER NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "fleet_tag" TEXT,
    "status" "TruckStatus" NOT NULL DEFAULT 'COMPLIANT',
    "needs_retest" BOOLEAN NOT NULL DEFAULT false,
    "next_due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_records" (
    "id" TEXT NOT NULL,
    "truck_id" TEXT NOT NULL,
    "test_date" TIMESTAMP(3) NOT NULL,
    "test_result" "TestResult" NOT NULL,
    "next_due_date" TIMESTAMP(3) NOT NULL,
    "tester_name" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "truck_id" TEXT NOT NULL,
    "reminder_date" TIMESTAMP(3) NOT NULL,
    "reminder_type" "ReminderType" NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_records" ADD CONSTRAINT "test_records_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
