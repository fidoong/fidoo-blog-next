// ============================================
// 角色定义
// ============================================

export enum Role {
  USER = 'USER',
  AUTHOR = 'AUTHOR',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

// ============================================
// 权限定义
// ============================================

export enum Permission {
  // 文章权限
  POST_CREATE = 'post:create',
  POST_READ = 'post:read',
  POST_UPDATE = 'post:update',
  POST_DELETE = 'post:delete',
  POST_PUBLISH = 'post:publish',
  POST_MANAGE_ALL = 'post:manage:all',

  // 评论权限
  COMMENT_CREATE = 'comment:create',
  COMMENT_DELETE = 'comment:delete',
  COMMENT_MANAGE_ALL = 'comment:manage:all',

  // 用户权限
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage:roles',

  // 系统权限
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  DASHBOARD_ACCESS = 'dashboard:access',
}

// ============================================
// 角色-权限映射
// ============================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.POST_READ,
    Permission.COMMENT_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
  ],

  [Role.AUTHOR]: [
    // 继承 USER 权限
    Permission.POST_CREATE,
    Permission.POST_READ,
    Permission.COMMENT_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    // 作者特有权限
    Permission.POST_UPDATE,
    Permission.POST_DELETE,
    Permission.POST_PUBLISH,
    Permission.DASHBOARD_ACCESS,
  ],

  [Role.MODERATOR]: [
    // 继承 AUTHOR 权限
    Permission.POST_CREATE,
    Permission.POST_READ,
    Permission.POST_UPDATE,
    Permission.POST_DELETE,
    Permission.POST_PUBLISH,
    Permission.COMMENT_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.DASHBOARD_ACCESS,
    // 版主特有权限
    Permission.POST_MANAGE_ALL,
    Permission.COMMENT_DELETE,
    Permission.COMMENT_MANAGE_ALL,
  ],

  [Role.ADMIN]: [
    // 所有权限
    ...Object.values(Permission),
  ],
}

// ============================================
// 权限检查工具
// ============================================

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

// 检查是否为资源所有者或有管理权限
export function canManageResource(
  userRole: Role,
  userId: string,
  resourceOwnerId: string
): boolean {
  // 资源所有者
  if (userId === resourceOwnerId) return true
  // 有管理所有资源权限
  if (hasPermission(userRole, Permission.POST_MANAGE_ALL)) return true
  return false
}

// ============================================
// 角色层级
// ============================================

const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.USER]: 0,
  [Role.AUTHOR]: 1,
  [Role.MODERATOR]: 2,
  [Role.ADMIN]: 3,
}

export function isRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
