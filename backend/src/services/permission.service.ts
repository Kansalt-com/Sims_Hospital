import { prisma } from "../db/prisma.js";
import type { UserRoleValue } from "../types/domain.js";

export const SYSTEM_PERMISSIONS = [
  {
    code: "dashboard:view",
    name: "View Dashboard",
    description: "Access operational dashboards and KPIs",
  },
  {
    code: "patients:manage",
    name: "Manage Patients",
    description: "Create and update patient registrations",
  },
  {
    code: "opd:manage",
    name: "Manage OPD",
    description: "Create OPD visits and move patients through the queue",
  },
  {
    code: "ipd:manage",
    name: "Manage IPD",
    description: "Admit, allocate beds, and discharge inpatients",
  },
  {
    code: "billing:manage",
    name: "Manage Billing",
    description: "Create invoices and collect payments",
  },
  {
    code: "billing:cancel",
    name: "Cancel Billing",
    description: "Cancel invoices and review cancelled bill audit history",
  },
  {
    code: "prescriptions:manage",
    name: "Manage Prescriptions",
    description: "Create and print prescriptions",
  },
  {
    code: "reports:view",
    name: "View Reports",
    description: "Access operational and revenue reports",
  },
  {
    code: "settings:manage",
    name: "Manage Settings",
    description: "Update organization settings and master data",
  },
  {
    code: "users:manage",
    name: "Manage Users",
    description: "Manage users, roles, and access",
  },
] as const;

const ROLE_PERMISSION_CODES: Record<UserRoleValue, string[]> = {
  ADMIN: SYSTEM_PERMISSIONS.map((permission) => permission.code),
  RECEPTION: [
    "dashboard:view",
    "patients:manage",
    "opd:manage",
    "ipd:manage",
    "billing:manage",
    "prescriptions:manage",
    "reports:view",
  ],
  DOCTOR: ["dashboard:view", "ipd:manage", "prescriptions:manage", "reports:view"],
  BILLING: ["dashboard:view", "billing:manage", "reports:view"],
  PHARMACY: ["dashboard:view", "billing:manage", "reports:view"],
  LAB_TECHNICIAN: ["dashboard:view", "reports:view"],
};

export const getPermissionsForRole = async (role: UserRoleValue) => {
  const rows = await prisma.rolePermission.findMany({
    where: { role },
    include: {
      permission: {
        select: {
          code: true,
        },
      },
    },
  });

  return rows.map((row: typeof rows[number]) => row.permission.code).sort();
};

export const ensurePermissionCatalog = async () => {
  for (const permission of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
        description: permission.description,
      },
      create: permission,
    });
  }

  const permissions = await prisma.permission.findMany({
    select: {
      id: true,
      code: true,
    },
  });

  const permissionIdByCode = new Map(
    permissions.map((permission: typeof permissions[number]) => [permission.code, permission.id] as const),
  );

  for (const [role, codes] of Object.entries(ROLE_PERMISSION_CODES) as Array<[UserRoleValue, string[]]>) {
    for (const code of codes) {
      const permissionId = permissionIdByCode.get(code);
      if (!permissionId) {
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role,
            permissionId,
          },
        },
        update: {},
        create: {
          role,
          permissionId,
        },
      });
    }
  }
};
