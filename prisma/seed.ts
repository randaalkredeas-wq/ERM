import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { risks as mockRisks } from "../src/lib/mock-data/risks";
import { incidents as mockIncidents } from "../src/lib/mock-data/incidents";
import { kris as mockKris } from "../src/lib/mock-data/kri";
import { approvals as mockApprovals } from "../src/lib/mock-data/approvals";
import { documents as mockDocuments } from "../src/lib/mock-data/documents";
import { auditLog as mockAuditLog } from "../src/lib/mock-data/audit-log";
import {
  notifications as mockNotifications,
  aiInsights as mockAiInsights,
} from "../src/lib/mock-data/notifications";
import {
  reportTemplates as mockReportTemplates,
  generatedReports as mockGeneratedReports,
} from "../src/lib/mock-data/reports";
import { creditExposures as mockCreditExposures } from "../src/lib/mock-data/portfolio";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Mock data uses kebab-case string unions; Prisma enums use SCREAMING_SNAKE_CASE. */
function toEnum(value: string) {
  return value.toUpperCase().replace(/-/g, "_");
}

const SEED_PASSWORD = "ChangeMe#2026";

interface SeedUser {
  name: string;
  email: string;
  role:
    | "SYSTEM_ADMIN"
    | "CRO"
    | "DEPARTMENT_MANAGER"
    | "RISK_OWNER"
    | "EMPLOYEE"
    | "AUDITOR"
    | "READONLY_EXECUTIVE";
  department?: string;
  jobTitle?: string;
  status?: "ACTIVE" | "INACTIVE" | "INVITED";
}

const SEED_USERS: SeedUser[] = [
  {
    name: "Layla Haddad",
    email: "layla.haddad@ermcorp.com",
    role: "CRO",
    department: "Risk & Compliance",
    jobTitle: "Chief Risk Officer",
  },
  {
    name: "Marcus Chen",
    email: "marcus.chen@ermcorp.com",
    role: "DEPARTMENT_MANAGER",
    department: "Risk & Compliance",
    jobTitle: "Compliance Manager",
  },
  {
    name: "Sara Al-Amin",
    email: "sara.alamin@ermcorp.com",
    role: "AUDITOR",
    department: "Internal Audit",
    jobTitle: "Internal Audit Lead",
  },
  {
    name: "Daniel Osei",
    email: "daniel.osei@ermcorp.com",
    role: "DEPARTMENT_MANAGER",
    department: "Finance",
    jobTitle: "Financial Risk Analyst",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@ermcorp.com",
    role: "DEPARTMENT_MANAGER",
    department: "Technology",
    jobTitle: "IT Risk Manager",
  },
  {
    name: "Omar Farouk",
    email: "omar.farouk@ermcorp.com",
    role: "DEPARTMENT_MANAGER",
    department: "Operations",
    jobTitle: "Operations Risk Lead",
  },
  {
    name: "Nadia Ibrahim",
    email: "nadia.ibrahim@ermcorp.com",
    role: "DEPARTMENT_MANAGER",
    department: "Strategy",
    jobTitle: "Strategy Lead",
  },
  {
    name: "Fatima Zahra",
    email: "fatima.zahra@ermcorp.com",
    role: "DEPARTMENT_MANAGER",
    department: "Human Resources",
    jobTitle: "HR Director",
  },
  {
    name: "Ahmed Nasser",
    email: "ahmed.nasser@ermcorp.com",
    role: "DEPARTMENT_MANAGER",
    department: "Legal",
    jobTitle: "General Counsel",
  },
  {
    name: "Yusuf Karimi",
    email: "yusuf.karimi@ermcorp.com",
    role: "RISK_OWNER",
    department: "Technology",
    jobTitle: "Security Analyst",
  },
  {
    name: "Admin",
    email: "admin@ermcorp.com",
    role: "SYSTEM_ADMIN",
    jobTitle: "System Administrator",
  },
  {
    name: "Hana Youssef",
    email: "hana.youssef@ermcorp.com",
    role: "EMPLOYEE",
    department: "Risk & Compliance",
    jobTitle: "Risk Analyst",
    status: "INVITED",
  },
  {
    name: "Khalid Al-Rashid",
    email: "khalid.alrashid@ermcorp.com",
    role: "READONLY_EXECUTIVE",
    jobTitle: "Board Member",
  },
];

async function seedUsers() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const byName = new Map<string, string>();

  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        department: u.department,
        jobTitle: u.jobTitle,
        status: u.status ?? "ACTIVE",
        lastLoginAt: u.status === "INVITED" ? null : new Date(),
      },
    });
    byName.set(u.name, user.id);
  }

  return byName;
}

function userId(byName: Map<string, string>, name: string): string {
  const id = byName.get(name);
  if (!id) throw new Error(`Seed error: no user found for name "${name}"`);
  return id;
}

async function seedRisks(byName: Map<string, string>) {
  for (const risk of mockRisks) {
    await prisma.risk.create({
      data: {
        code: risk.id,
        title: risk.title,
        description: risk.description,
        department: risk.department,
        category: risk.category,
        subcategory: risk.subcategory,
        riskSource: risk.riskSource,
        riskType: risk.riskType,
        strategicObjective: risk.strategicObjective,
        rootCause: risk.rootCause,
        consequences: risk.consequences,
        existingControls: risk.existingControls,
        controlEffectiveness: toEnum(risk.controlEffectiveness) as never,
        inherentLikelihood: risk.inherentLikelihood,
        inherentImpact: risk.inherentImpact,
        inherentRisk: toEnum(risk.inherentRisk) as never,
        likelihood: risk.likelihood,
        impact: risk.impact,
        targetLikelihood: risk.targetLikelihood,
        targetImpact: risk.targetImpact,
        targetRisk: toEnum(risk.targetRisk) as never,
        riskTreatment: toEnum(risk.riskTreatment) as never,
        reviewFrequency: toEnum(risk.reviewFrequency) as never,
        nextReviewDate: new Date(risk.nextReviewDate),
        ownerId: userId(byName, risk.owner),
        status: toEnum(risk.status) as never,
        workflowStatus: toEnum(risk.workflowStatus) as never,
        dueDate: new Date(risk.dueDate),
        isArchived: risk.isArchived,
        createdById: userId(byName, risk.createdBy),
        createdAt: new Date(risk.createdAt),
        updatedAt: new Date(risk.updatedAt),
        attachments: {
          create: risk.attachments.map((a) => ({
            name: a.name,
            type: toEnum(a.type) as never,
            size: parseSizeToBytes(a.size),
            storageKey: `seed-placeholder/${risk.id}/${a.id}-${a.name}`,
            uploadedById: userId(byName, a.uploadedBy),
            uploadedAt: new Date(a.uploadedAt),
          })),
        },
        comments: {
          create: risk.comments.map((c) => ({
            authorId: userId(byName, c.author),
            message: c.message,
            createdAt: new Date(c.createdAt),
          })),
        },
        treatmentPlans: {
          create: risk.treatmentPlans.map((t) => ({
            title: t.title,
            ownerId: userId(byName, t.owner),
            dueDate: new Date(t.dueDate),
            status: toEnum(t.status) as never,
            progress: t.progress,
          })),
        },
        auditTrail: {
          create: risk.auditTrail.map((entry) => ({
            userId: byName.get(entry.user) ?? null,
            action: entry.action,
            details: entry.details,
            createdAt: parseAuditTimestamp(entry.timestamp),
          })),
        },
        versions: {
          create: risk.versions.map((v) => ({
            version: v.version,
            editedById: userId(byName, v.editedBy),
            summary: v.summary,
            snapshot: v.snapshot as unknown as Prisma.InputJsonValue,
            createdAt: new Date(v.editedAt),
          })),
        },
        workflowHistory: {
          create: risk.workflowHistory.map((w) => ({
            fromStatus: toEnum(w.fromStatus) as never,
            toStatus: toEnum(w.toStatus) as never,
            actorId: userId(byName, w.actor),
            comment: w.comment,
            createdAt: parseAuditTimestamp(w.timestamp),
          })),
        },
      },
    });
  }
}

function parseSizeToBytes(size: string): number {
  const match = /^([\d.]+)\s*(KB|MB|GB)$/i.exec(size.trim());
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multiplier = unit === "GB" ? 1024 ** 3 : unit === "MB" ? 1024 ** 2 : 1024;
  return Math.round(value * multiplier);
}

function parseAuditTimestamp(timestamp: string): Date {
  // Mock timestamps look like "2026-07-28 14:02" - make them ISO-parseable.
  return new Date(timestamp.replace(" ", "T"));
}

async function seedIncidents(byName: Map<string, string>) {
  for (const incident of mockIncidents) {
    await prisma.incident.create({
      data: {
        code: incident.id,
        title: incident.title,
        category: incident.category,
        severity: toEnum(incident.severity) as never,
        reportedById: userId(byName, incident.reportedBy),
        status: toEnum(incident.status) as never,
        createdAt: new Date(incident.reportedAt),
        updatedAt: new Date(incident.reportedAt),
      },
    });
  }
}

async function seedKris() {
  for (const kri of mockKris) {
    await prisma.kriIndicator.create({
      data: {
        code: kri.id,
        name: kri.name,
        category: kri.category,
        current: kri.current,
        target: kri.target,
        unit: kri.unit,
        trend: kri.trend,
        status: toEnum(kri.status) as never,
      },
    });
  }
}

async function seedApprovals(byName: Map<string, string>) {
  for (const approval of mockApprovals) {
    const isDecided = approval.status !== "pending";
    await prisma.approval.create({
      data: {
        code: approval.id,
        title: approval.title,
        type: approval.type,
        requestedById: userId(byName, approval.requestedBy),
        submittedAt: new Date(approval.submittedAt),
        dueDate: new Date(approval.dueDate),
        priority: toEnum(approval.priority) as never,
        status: toEnum(approval.status) as never,
        decidedAt: isDecided ? new Date(approval.dueDate) : null,
        decidedById: isDecided ? userId(byName, "Layla Haddad") : null,
      },
    });
  }
}

async function seedDocuments(byName: Map<string, string>) {
  for (const doc of mockDocuments) {
    await prisma.document.create({
      data: {
        name: doc.name,
        category: doc.category,
        ownerId: userId(byName, doc.owner),
        version: doc.version,
        storageKey: `seed-placeholder/documents/${doc.id}`,
        size: parseSizeToBytes(doc.size),
        fileType: toEnum(doc.fileType) as never,
        updatedAt: new Date(doc.updatedAt),
      },
    });
  }
}

async function seedAuditLog(byName: Map<string, string>) {
  for (const entry of mockAuditLog) {
    await prisma.auditLogEntry.create({
      data: {
        userId: byName.get(entry.user) ?? null,
        action: entry.action,
        module: entry.module,
        details: entry.details,
        ipAddress: entry.ip,
        createdAt: parseAuditTimestamp(entry.timestamp),
      },
    });
  }
}

async function seedNotifications(byName: Map<string, string>) {
  const croId = userId(byName, "Layla Haddad");
  for (const n of mockNotifications) {
    await prisma.notification.create({
      data: {
        userId: croId,
        title: n.title,
        description: n.description,
        tone: toEnum(n.tone) as never,
        read: n.read,
      },
    });
  }
}

async function seedAiInsights() {
  for (const insight of mockAiInsights) {
    await prisma.aiInsight.create({
      data: {
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        category: insight.category,
        severity: toEnum(insight.severity) as never,
        createdAt: new Date(insight.generatedAt),
      },
    });
  }
}

async function seedReports(byName: Map<string, string>) {
  for (const tpl of mockReportTemplates) {
    await prisma.reportTemplate.create({
      data: { name: tpl.name, description: tpl.description, category: tpl.category },
    });
  }
  for (const report of mockGeneratedReports) {
    await prisma.generatedReport.create({
      data: {
        name: report.name,
        type: report.type,
        generatedById: userId(byName, report.generatedBy),
        format: report.format,
        createdAt: new Date(report.date),
      },
    });
  }
}

async function seedPortfolio(byName: Map<string, string>) {
  for (const exposure of mockCreditExposures) {
    await prisma.creditExposure.create({
      data: {
        code: exposure.id,
        customerName: exposure.customerName,
        segment: exposure.segment,
        sector: exposure.sector,
        product: exposure.product,
        exposureAmount: exposure.exposureAmount,
        outstandingBalance: exposure.outstandingBalance,
        daysPastDue: exposure.daysPastDue,
        eclStage: toEnum(exposure.eclStage) as never,
        eclAmount: exposure.eclAmount,
        riskRating: exposure.riskRating,
        collectionStatus: toEnum(exposure.collectionStatus) as never,
        collectorId:
          exposure.collector === "—" ? null : (byName.get(exposure.collector) ?? null),
        lastPaymentDate: new Date(exposure.lastPaymentDate),
        nextActionDate: new Date(exposure.nextActionDate),
      },
    });
  }
}

async function main() {
  console.log("Seeding users...");
  const byName = await seedUsers();

  console.log("Seeding risks (with attachments/comments/treatment/audit/versions/workflow)...");
  await seedRisks(byName);

  console.log("Seeding incidents...");
  await seedIncidents(byName);

  console.log("Seeding KRI/KPI indicators...");
  await seedKris();

  console.log("Seeding approvals...");
  await seedApprovals(byName);

  console.log("Seeding documents...");
  await seedDocuments(byName);

  console.log("Seeding global audit log...");
  await seedAuditLog(byName);

  console.log("Seeding notifications...");
  await seedNotifications(byName);

  console.log("Seeding AI insights...");
  await seedAiInsights();

  console.log("Seeding report templates + generated reports...");
  await seedReports(byName);

  console.log("Seeding credit portfolio exposures...");
  await seedPortfolio(byName);

  console.log("\nSeed complete.");
  console.log(`All ${SEED_USERS.length} seeded users share the password: ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
