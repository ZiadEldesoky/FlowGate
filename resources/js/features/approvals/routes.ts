/**
 * Thin frontend accessors over generated Wayfinder helpers.
 * Generated artifacts live in resources/js/routes (gitignored).
 * Run: php artisan wayfinder:generate --with-form
 */
import type { InertiaLinkProps } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';
import { index as indexRoute } from '@/routes/approvals';

export type ApprovalsIndexQuery = {
    search?: string;
    page?: number | string | null;
};

function compactQuery(
    query: ApprovalsIndexQuery = {},
): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (query.search && query.search.trim().length > 0) {
        params.search = query.search.trim();
    }

    if (
        query.page !== null &&
        query.page !== undefined &&
        String(query.page).length > 0
    ) {
        params.page = query.page;
    }

    return params;
}

function asHref(
    definition: NonNullable<InertiaLinkProps['href']>,
): NonNullable<InertiaLinkProps['href']> {
    return definition;
}

export const approvalRoutes = {
    index: (query: ApprovalsIndexQuery = {}) => {
        const params = compactQuery(query);

        return asHref(
            indexRoute(
                Object.keys(params).length > 0 ? { query: params } : undefined,
            ),
        );
    },
    indexUrl: (query: ApprovalsIndexQuery = {}): string =>
        toUrl(approvalRoutes.index(query)),
} as const;
