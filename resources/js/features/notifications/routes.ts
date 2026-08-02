import type { InertiaLinkProps } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';
import {
    index as indexRoute,
    read as readRoute,
    readAll as readAllRoute,
} from '@/routes/notifications';

function asHref(
    definition: NonNullable<InertiaLinkProps['href']>,
): NonNullable<InertiaLinkProps['href']> {
    return definition;
}

export const notificationRoutes = {
    index: () => asHref(indexRoute()),
    indexUrl: (): string => toUrl(indexRoute()),
    read: (notificationId: string) => asHref(readRoute(notificationId)),
    readUrl: (notificationId: string): string =>
        toUrl(readRoute(notificationId)),
    readAll: () => asHref(readAllRoute()),
    readAllUrl: (): string => toUrl(readAllRoute()),
} as const;
