/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'livreur',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position" INTEGER,
    "name" TEXT NOT NULL,
    "imageFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position" INTEGER,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "isPublish" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dailyNumber" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB NOT NULL,
    "totalePrice" REAL NOT NULL,
    "isPayed" BOOLEAN NOT NULL DEFAULT true,
    "delevryPrice" REAL,
    "clientPhoneNumber" TEXT,
    "delevryId" INTEGER,
    "dayId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_delevryId_fkey" FOREIGN KEY ("delevryId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "days" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'en cours de préparation',
    "paymentProductId" INTEGER,
    "paymentOfferId" INTEGER,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_paymentProductId_fkey" FOREIGN KEY ("paymentProductId") REFERENCES "payments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_paymentOfferId_fkey" FOREIGN KEY ("paymentOfferId") REFERENCES "payment_offer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "isPublish" BOOLEAN NOT NULL DEFAULT true,
    "imageFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payment_offer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dailyNumber" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB NOT NULL,
    "isPayed" BOOLEAN NOT NULL DEFAULT true,
    "totalePrice" REAL NOT NULL,
    "delevryPrice" REAL,
    "clientPhoneNumber" TEXT,
    "delevryId" INTEGER,
    "dayId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payment_offer_delevryId_fkey" FOREIGN KEY ("delevryId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payment_offer_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "days" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "days" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stopeAt" DATETIME
);

-- CreateTable
CREATE TABLE "_PaymentProductToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PaymentProductToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PaymentProductToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_OfferToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_OfferToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "offers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OfferToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_OfferToPaymentOffer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_OfferToPaymentOffer_A_fkey" FOREIGN KEY ("A") REFERENCES "offers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OfferToPaymentOffer_B_fkey" FOREIGN KEY ("B") REFERENCES "payment_offer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentProductId_key" ON "orders"("paymentProductId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentOfferId_key" ON "orders"("paymentOfferId");

-- CreateIndex
CREATE UNIQUE INDEX "_PaymentProductToProduct_AB_unique" ON "_PaymentProductToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_PaymentProductToProduct_B_index" ON "_PaymentProductToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OfferToProduct_AB_unique" ON "_OfferToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_OfferToProduct_B_index" ON "_OfferToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OfferToPaymentOffer_AB_unique" ON "_OfferToPaymentOffer"("A", "B");

-- CreateIndex
CREATE INDEX "_OfferToPaymentOffer_B_index" ON "_OfferToPaymentOffer"("B");
