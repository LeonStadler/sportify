import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { parseAvatarConfig, getUserInitials } from "@/lib/avatar";
import { User } from "@/contexts/AuthContext";
import NiceAvatar from "react-nice-avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ user, size = 40, className, fallbackClassName }: UserAvatarProps) {
  const avatarConfig = user?.avatar ? parseAvatarConfig(user.avatar) : null;
  
  return (
    <Avatar className={cn("", className)} style={{ width: `${size}px`, height: `${size}px` }}>
      {avatarConfig ? (
        <NiceAvatar 
          style={{ width: `${size}px`, height: `${size}px` }} 
          {...avatarConfig} 
        />
      ) : (
        <AvatarFallback className={fallbackClassName}>
          {getUserInitials(user)}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

