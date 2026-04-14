import { getServerSession } from 'next-auth/next'
import { authConfig } from './config'
import { hasPermission, Permission, Role, canManageResource } from './rbac'

// 检查是否已认证
export async function requireAuth() {
  const session = await getServerSession(authConfig)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!hasPermission(session.user.role as Role, permission)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return session.user
}

export async function requireAnyPermission(permissions: Permission[]) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const hasAny = permissions.some((p) =>
    hasPermission(session.user.role as Role, p)
  )

  if (!hasAny) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return session.user
}

export async function requireResourceAccess(ownerId: string) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const canAccess = canManageResource(
    session.user.role as Role,
    session.user.id,
    ownerId
  )

  if (!canAccess) {
    throw new Error('Forbidden: Not resource owner')
  }

  return session.user
}

export async function requireRole(role: Role) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (session.user.role !== role) {
    throw new Error('Forbidden: Insufficient role')
  }

  return session.user
}

export async function requireMinimumRole(role: Role) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const roleHierarchy: Record<string, number> = {
    USER: 0,
    AUTHOR: 1,
    MODERATOR: 2,
    ADMIN: 3,
  }

  if (roleHierarchy[session.user.role] < roleHierarchy[role]) {
    throw new Error('Forbidden: Insufficient role')
  }

  return session.user
}
