/**
 * Permission System - Barrel Export
 * ส่งออก Types, Hooks, และ Utilities ทั้งหมดของระบบ Permission
 */

// Types
export type {
  Module,
  PermissionLevel,
  ComponentKey,
  ModulePermission,
  Role,
  User,
  PermissionCheckResult,
  PermissionContextState,
} from './types';

// Context & Hooks
export {
  PermissionProvider,
  usePermissions,
  useComponentPermission,
  useModuleAccess,
} from './PermissionContext';

// Mock Data (for development/testing)
export {
  AdminRole,
  ManagerRole,
  SalesRole,
  PurchaseRole,
  AccountantRole,
  mockUsers,
  mockLogin,
  getMockCurrentUser,
} from './mockData';
