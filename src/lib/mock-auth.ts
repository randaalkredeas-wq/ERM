/**
 * Fully mock authentication data. No database, no Prisma, no API calls -
 * this is a static, in-memory list of demo accounts used only until real
 * authentication is implemented in a later phase.
 */

export type MockUserRole =
  | "SYSTEM_ADMIN"
  | "CRO"
  | "DEPARTMENT_MANAGER"
  | "RISK_OWNER"
  | "EMPLOYEE"
  | "AUDITOR"
  | "READONLY_EXECUTIVE";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: MockUserRole;
  department: string;
  jobTitle: string;
  phone: string;
  location: string;
  status: "active";
  lastLoginAt: string | null;
  createdAt: string;
}

interface DemoAccountRecord extends MockUser {
  password: string;
}

const DEMO_PASSWORD = "123456";

const DEMO_ACCOUNT_RECORDS: DemoAccountRecord[] = [
  {
    id: "demo-system-admin",
    name: "System Administrator",
    email: "admin@loqen.com",
    password: DEMO_PASSWORD,
    role: "SYSTEM_ADMIN",
    department: "Technology",
    jobTitle: "System Administrator",
    phone: "+1 (555) 010-0100",
    location: "New York, USA",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-01-06",
  },
  {
    id: "demo-cro",
    name: "Chief Risk Officer",
    email: "cro@loqen.com",
    password: DEMO_PASSWORD,
    role: "CRO",
    department: "Risk & Compliance",
    jobTitle: "Chief Risk Officer",
    phone: "+1 (555) 010-0101",
    location: "New York, USA",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-01-06",
  },
  {
    id: "demo-department-manager",
    name: "Department Manager",
    email: "manager@loqen.com",
    password: DEMO_PASSWORD,
    role: "DEPARTMENT_MANAGER",
    department: "Operations",
    jobTitle: "Department Manager",
    phone: "+1 (555) 010-0102",
    location: "Chicago, USA",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-01-06",
  },
  {
    id: "demo-risk-owner",
    name: "Risk Owner",
    email: "owner@loqen.com",
    password: DEMO_PASSWORD,
    role: "RISK_OWNER",
    department: "Finance",
    jobTitle: "Risk Owner",
    phone: "+1 (555) 010-0103",
    location: "Boston, USA",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-01-06",
  },
  {
    id: "demo-employee",
    name: "Employee",
    email: "employee@loqen.com",
    password: DEMO_PASSWORD,
    role: "EMPLOYEE",
    department: "Human Resources",
    jobTitle: "Employee",
    phone: "+1 (555) 010-0104",
    location: "Austin, USA",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-01-06",
  },
  {
    id: "demo-auditor",
    name: "Auditor",
    email: "auditor@loqen.com",
    password: DEMO_PASSWORD,
    role: "AUDITOR",
    department: "Internal Audit",
    jobTitle: "Internal Auditor",
    phone: "+1 (555) 010-0105",
    location: "London, UK",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-01-06",
  },
  {
    id: "demo-executive",
    name: "Executive",
    email: "executive@loqen.com",
    password: DEMO_PASSWORD,
    role: "READONLY_EXECUTIVE",
    department: "Strategy",
    jobTitle: "Chief Executive Officer",
    phone: "+1 (555) 010-0106",
    location: "New York, USA",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-01-06",
  },
];

function toMockUser(record: DemoAccountRecord): MockUser {
  const {
    id,
    name,
    email,
    role,
    department,
    jobTitle,
    phone,
    location,
    status,
    lastLoginAt,
    createdAt,
  } = record;
  return {
    id,
    name,
    email,
    role,
    department,
    jobTitle,
    phone,
    location,
    status,
    lastLoginAt,
    createdAt,
  };
}

/** Public-safe list (no passwords) for display in the demo accounts panel. */
export const DEMO_ACCOUNTS: MockUser[] = DEMO_ACCOUNT_RECORDS.map(toMockUser);

export const DEMO_ACCOUNT_PASSWORD = DEMO_PASSWORD;

export function verifyDemoCredentials(
  email: string,
  password: string,
): MockUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const record = DEMO_ACCOUNT_RECORDS.find(
    (account) => account.email.toLowerCase() === normalizedEmail,
  );
  if (!record || record.password !== password) return null;
  return toMockUser(record);
}

export function getDemoAccountById(id: string): MockUser | null {
  const record = DEMO_ACCOUNT_RECORDS.find((account) => account.id === id);
  if (!record) return null;
  return toMockUser(record);
}
