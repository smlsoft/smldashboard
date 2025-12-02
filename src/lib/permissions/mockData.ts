/**
 * Mock Permission Data
 * ข้อมูล Role และ User ตัวอย่างสำหรับทดสอบระบบ Permission
 */

import type { Role, User } from './types';

// ==================== Roles ====================

// Admin: เข้าถึงได้ทุกอย่าง
export const AdminRole: Role = {
  id: 'admin',
  name: 'ผู้ดูแลระบบ',
  description: 'เข้าถึงได้ทุก Module และทุก Component',
  permissions: [
    {
      module: 'accounting',
      level: 'full',
      components: {
        'accounting.kpis': 'full',
        'accounting.pl_statement': 'full',
        'accounting.balance_sheet': 'full',
        'accounting.cash_flow': 'full',
        'accounting.ar_aging': 'full',
        'accounting.ap_aging': 'full',
        'accounting.revenue_breakdown': 'full',
        'accounting.expense_breakdown': 'full',
      },
    },
    {
      module: 'sales',
      level: 'full',
      components: {
        'sales.kpis': 'full',
        'sales.trend': 'full',
        'sales.top_products': 'full',
        'sales.by_branch': 'full',
        'sales.by_salesperson': 'full',
        'sales.top_customers': 'full',
        'sales.ar_status': 'full',
      },
    },
    {
      module: 'purchase',
      level: 'full',
      components: {
        'purchase.kpis': 'full',
        'purchase.trend': 'full',
        'purchase.top_suppliers': 'full',
        'purchase.by_category': 'full',
        'purchase.by_brand': 'full',
        'purchase.ap_outstanding': 'full',
      },
    },
    {
      module: 'inventory',
      level: 'full',
      components: {
        'inventory.kpis': 'full',
        'inventory.stock_movement': 'full',
        'inventory.low_stock': 'full',
        'inventory.overstock': 'full',
        'inventory.slow_moving': 'full',
        'inventory.turnover': 'full',
        'inventory.by_branch': 'full',
      },
    },
  ],
};

// Manager: เข้าถึงได้ทุก Module แต่เฉพาะ View
export const ManagerRole: Role = {
  id: 'manager',
  name: 'ผู้จัดการ',
  description: 'เข้าถึงได้ทุก Module (View Only)',
  permissions: [
    {
      module: 'accounting',
      level: 'view',
      components: {
        'accounting.kpis': 'view',
        'accounting.pl_statement': 'view',
        'accounting.balance_sheet': 'view',
        'accounting.cash_flow': 'view',
        'accounting.ar_aging': 'view',
        'accounting.ap_aging': 'view',
        'accounting.revenue_breakdown': 'view',
        'accounting.expense_breakdown': 'view',
      },
    },
    {
      module: 'sales',
      level: 'view',
      components: {
        'sales.kpis': 'view',
        'sales.trend': 'view',
        'sales.top_products': 'view',
        'sales.by_branch': 'view',
        'sales.by_salesperson': 'view',
        'sales.top_customers': 'view',
        'sales.ar_status': 'view',
      },
    },
    {
      module: 'purchase',
      level: 'view',
      components: {
        'purchase.kpis': 'view',
        'purchase.trend': 'view',
        'purchase.top_suppliers': 'view',
        'purchase.by_category': 'view',
        'purchase.by_brand': 'view',
        'purchase.ap_outstanding': 'view',
      },
    },
    {
      module: 'inventory',
      level: 'view',
      components: {
        'inventory.kpis': 'view',
        'inventory.stock_movement': 'view',
        'inventory.low_stock': 'view',
        'inventory.overstock': 'view',
        'inventory.slow_moving': 'view',
        'inventory.turnover': 'view',
        'inventory.by_branch': 'view',
      },
    },
  ],
};

// Sales Staff: เข้าถึงเฉพาะ Sales Module
export const SalesRole: Role = {
  id: 'sales',
  name: 'พนักงานขาย',
  description: 'เข้าถึงเฉพาะ Module ขายและข้อมูลลูกค้า',
  permissions: [
    {
      module: 'accounting',
      level: 'none',
      components: {},
    },
    {
      module: 'sales',
      level: 'full',
      components: {
        'sales.kpis': 'view',
        'sales.trend': 'view',
        'sales.top_products': 'view',
        'sales.by_branch': 'view',
        'sales.by_salesperson': 'full',
        'sales.top_customers': 'view',
        'sales.ar_status': 'view',
      },
    },
    {
      module: 'purchase',
      level: 'none',
      components: {},
    },
    {
      module: 'inventory',
      level: 'view',
      components: {
        'inventory.kpis': 'view',
        'inventory.stock_movement': 'view',
        'inventory.low_stock': 'view',
        'inventory.overstock': 'none',
        'inventory.slow_moving': 'none',
        'inventory.turnover': 'none',
        'inventory.by_branch': 'view',
      },
    },
  ],
};

// Purchase Staff: เข้าถึงเฉพาะ Purchase และ Inventory Module
export const PurchaseRole: Role = {
  id: 'purchase',
  name: 'พนักงานจัดซื้อ',
  description: 'เข้าถึงเฉพาะ Module จัดซื้อและคลังสินค้า',
  permissions: [
    {
      module: 'accounting',
      level: 'none',
      components: {},
    },
    {
      module: 'sales',
      level: 'none',
      components: {},
    },
    {
      module: 'purchase',
      level: 'full',
      components: {
        'purchase.kpis': 'view',
        'purchase.trend': 'view',
        'purchase.top_suppliers': 'full',
        'purchase.by_category': 'view',
        'purchase.by_brand': 'view',
        'purchase.ap_outstanding': 'full',
      },
    },
    {
      module: 'inventory',
      level: 'full',
      components: {
        'inventory.kpis': 'view',
        'inventory.stock_movement': 'view',
        'inventory.low_stock': 'full',
        'inventory.overstock': 'full',
        'inventory.slow_moving': 'full',
        'inventory.turnover': 'view',
        'inventory.by_branch': 'view',
      },
    },
  ],
};

// Accountant: เข้าถึงเฉพาะ Accounting Module
export const AccountantRole: Role = {
  id: 'accountant',
  name: 'นักบัญชี',
  description: 'เข้าถึงเฉพาะ Module บัญชีและรายงานทางการเงิน',
  permissions: [
    {
      module: 'accounting',
      level: 'full',
      components: {
        'accounting.kpis': 'full',
        'accounting.pl_statement': 'full',
        'accounting.balance_sheet': 'full',
        'accounting.cash_flow': 'full',
        'accounting.ar_aging': 'full',
        'accounting.ap_aging': 'full',
        'accounting.revenue_breakdown': 'full',
        'accounting.expense_breakdown': 'full',
      },
    },
    {
      module: 'sales',
      level: 'view',
      components: {
        'sales.kpis': 'view',
        'sales.trend': 'view',
        'sales.top_products': 'none',
        'sales.by_branch': 'view',
        'sales.by_salesperson': 'none',
        'sales.top_customers': 'none',
        'sales.ar_status': 'view',
      },
    },
    {
      module: 'purchase',
      level: 'view',
      components: {
        'purchase.kpis': 'view',
        'purchase.trend': 'view',
        'purchase.top_suppliers': 'none',
        'purchase.by_category': 'view',
        'purchase.by_brand': 'view',
        'purchase.ap_outstanding': 'view',
      },
    },
    {
      module: 'inventory',
      level: 'view',
      components: {
        'inventory.kpis': 'view',
        'inventory.stock_movement': 'none',
        'inventory.low_stock': 'none',
        'inventory.overstock': 'none',
        'inventory.slow_moving': 'view',
        'inventory.turnover': 'view',
        'inventory.by_branch': 'view',
      },
    },
  ],
};

// ==================== Mock Users ====================

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    role: AdminRole,
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@company.com',
    role: ManagerRole,
  },
  {
    id: '3',
    username: 'sales01',
    email: 'sales@company.com',
    role: SalesRole,
  },
  {
    id: '4',
    username: 'purchase01',
    email: 'purchase@company.com',
    role: PurchaseRole,
  },
  {
    id: '5',
    username: 'accountant',
    email: 'accountant@company.com',
    role: AccountantRole,
  },
];

// ฟังก์ชันสำหรับ Mock Authentication
export function mockLogin(username: string): User | null {
  return mockUsers.find((u) => u.username === username) || null;
}

// ฟังก์ชันสำหรับ Get Current User (Mock)
export function getMockCurrentUser(): User {
  // Default to Manager role for testing
  return mockUsers[1]; // Manager
}
