import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageTemplateProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    headerActions?: ReactNode;
    headerClassName?: string;
}

export function PageTemplate({
    title,
    subtitle,
    children,
    className,
    headerActions,
    headerClassName,
}: PageTemplateProps) {
    return (
        <div className={cn("space-y-4 md:space-y-6 pb-20 md:pb-6 min-w-0", className)}>
            {/* Header Section */}
            <div className={cn(
                "px-4 md:px-0 space-y-2",
                headerClassName
            )}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-muted-foreground mt-2 text-sm md:text-base leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {headerActions && (
                        <div className="flex items-start gap-2 shrink-0">
                            {headerActions}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 md:px-0 min-w-0">
                {children}
            </div>
        </div>
    );
}
