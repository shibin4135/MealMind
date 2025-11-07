-- Rename the columns and handle existing data
ALTER TABLE "Profile" RENAME COLUMN "subcriptionIsActive" TO "subscriptionIsActive";
ALTER TABLE "Profile" RENAME COLUMN "subscrptionTier" TO "subscriptionTier";