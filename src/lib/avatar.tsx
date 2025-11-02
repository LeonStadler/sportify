import NiceAvatar, { NiceAvatarProps } from 'react-nice-avatar';
import { User } from '@/contexts/AuthContext';

/**
 * Parses avatar configuration from string (JSON) or returns default config
 */
export function parseAvatarConfig(avatar: string | undefined | null): NiceAvatarProps | null {
  if (!avatar) return null;
  
  try {
    const config = JSON.parse(avatar);
    return config as NiceAvatarProps;
  } catch {
    return null;
  }
}

/**
 * Gets user initials for fallback avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user) return '?';
  if (user.displayPreference === 'nickname' && user.nickname && user.nickname.trim() !== '') {
    return user.nickname.substring(0, 2).toUpperCase();
  }
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

/**
 * Renders avatar component with fallback
 */
export function renderAvatar(
  avatar: string | undefined | null,
  user: User | null,
  size: number = 40,
  className?: string
) {
  const config = parseAvatarConfig(avatar);
  
  if (config) {
    return (
      <NiceAvatar 
        style={{ width: `${size}px`, height: `${size}px` }} 
        {...config} 
        className={className}
      />
    );
  }
  
  return getUserInitials(user);
}

