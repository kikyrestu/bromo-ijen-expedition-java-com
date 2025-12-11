import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate session token
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// WordPress-style roles
export const ROLES = {
  ADMINISTRATOR: 'administrator',
  EDITOR: 'editor',
  AUTHOR: 'author',
  CONTRIBUTOR: 'contributor',
  SUBSCRIBER: 'subscriber'
} as const;

export type UserRole = keyof typeof ROLES;
type RoleValue = typeof ROLES[UserRole];

// Role capabilities (WordPress-style)
type Capabilities = {
  [key in RoleValue]: string[];
};

export const CAPABILITIES: Capabilities = {
  [ROLES.ADMINISTRATOR]: [
    'manage_options',
    'manage_users',
    'edit_theme_options',
    'delete_users',
    'create_users',
    'edit_users',
    'edit_packages',
    'delete_packages',
    'publish_packages',
    'edit_published_packages',
    'delete_published_packages',
    'edit_posts',
    'delete_posts',
    'publish_posts',
    'edit_published_posts',
    'delete_published_posts',
    'upload_files',
    'moderate_comments'
  ],
  editor: [
    'edit_packages',
    'delete_packages',
    'publish_packages',
    'edit_published_packages',
    'delete_published_packages',
    'edit_posts',
    'delete_posts',
    'publish_posts',
    'edit_published_posts',
    'delete_published_posts',
    'upload_files',
    'moderate_comments'
  ],
  author: [
    'edit_packages',
    'publish_packages',
    'edit_published_packages',
    'delete_published_packages',
    'edit_posts',
    'publish_posts',
    'edit_published_posts',
    'delete_published_posts',
    'upload_files'
  ],
  contributor: [
    'edit_packages',
    'delete_packages',
    'edit_posts',
    'delete_posts'
  ],
  subscriber: []
};

// Check if user has capability
export function userCan(role: UserRole, capability: string): boolean {
  const roleValue = ROLES[role];
  return CAPABILITIES[roleValue]?.includes(capability) || false;
}

// Check if role can access CMS
export function canAccessCMS(role: UserRole): boolean {
  return role !== 'SUBSCRIBER';
}

// Session expiry (7 days)
export const SESSION_EXPIRY_DAYS = 7;

// Max login attempts before lockout
export const MAX_LOGIN_ATTEMPTS = 5;

// Lockout duration (15 minutes)
export const LOCKOUT_DURATION_MINUTES = 15;

