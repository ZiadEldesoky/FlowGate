import { Link } from '@inertiajs/react';
import { getAdministrationCopy } from '@/features/administration/i18n';
import { administrationRoutes } from '@/features/administration/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useDirection } from '@/hooks/use-direction';
import { cn } from '@/lib/utils';

const items = [
    {
        key: 'departments',
        href: () => administrationRoutes.departments.index(),
        label: (locale: 'ar' | 'en') =>
            getAdministrationCopy(locale).departmentsNav,
    },
    {
        key: 'users',
        href: () => administrationRoutes.users.index(),
        label: (locale: 'ar' | 'en') => getAdministrationCopy(locale).usersNav,
    },
    {
        key: 'activity',
        href: () => administrationRoutes.activity.index(),
        label: (locale: 'ar' | 'en') =>
            getAdministrationCopy(locale).activityNav,
    },
] as const;

export function AdministrationSubnav() {
    const { locale } = useDirection();
    const { isCurrentUrl } = useCurrentUrl();
    const t = getAdministrationCopy(locale);

    return (
        <nav
            aria-label={t.subnavLabel}
            className="flex flex-wrap gap-2 border-b pb-3"
        >
            {items.map((item) => {
                const href = item.href();
                const active = isCurrentUrl(href, undefined, true);

                return (
                    <Link
                        key={item.key}
                        href={href}
                        prefetch
                        className={cn(
                            'rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                            active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                        aria-current={active ? 'page' : undefined}
                    >
                        {item.label(locale)}
                    </Link>
                );
            })}
        </nav>
    );
}
