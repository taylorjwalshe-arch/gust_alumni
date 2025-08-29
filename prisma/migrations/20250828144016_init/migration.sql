-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "gradYear" INTEGER,
    "industry" TEXT,
    "company" TEXT,
    "location" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");
