import type { AppLocale } from '@/types/locale';
import type { PresentationStatus } from '@/types/status';
import { getPresentationStatus } from '@/lib/status';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
    status: PresentationStatus | string;
    locale?: AppLocale;
    className?: string;
    showDescription?: boolean;
};

function StatusBadge({
    status,
    locale = 'ar',
    className,
    showDescription = false,
}: StatusBadgeProps) {
    const config = getPresentationStatus(status);

    if (!config) {
        return (
            <Badge variant="outline" className={cn(className)}>
                {status}
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            title={
                showDescription ? config.description[locale] : undefined
            }
            className={cn(
                'border font-medium',
                config.className,
                className,
            )}
        >
            {config.label[locale]}
        </Badge>
    );
}

export { StatusBadge };
export type { StatusBadgeProps };
