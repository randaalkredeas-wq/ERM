-- CreateTable
CREATE TABLE "CodeSequence" (
    "prefix" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "CodeSequence_pkey" PRIMARY KEY ("prefix")
);

-- Seed each prefix's counter above the highest numeric suffix already in use,
-- so newly issued codes never collide with rows that predate this migration.
INSERT INTO "CodeSequence" ("prefix", "value")
SELECT 'RSK', GREATEST(1000, COALESCE(MAX(CAST(SUBSTRING("code" FROM 5) AS INTEGER)), 1000))
FROM "Risk"
ON CONFLICT ("prefix") DO NOTHING;

INSERT INTO "CodeSequence" ("prefix", "value")
SELECT 'INC', GREATEST(1000, COALESCE(MAX(CAST(SUBSTRING("code" FROM 5) AS INTEGER)), 1000))
FROM "Incident"
ON CONFLICT ("prefix") DO NOTHING;
