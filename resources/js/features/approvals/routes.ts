/**
 * Temporary URL builders for the approvals queue.
 * Root will add backend routes; replace with generated Wayfinder helpers then.
 * Keep path construction centralized here.
 */
import type { InertiaLinkProps } from '@inertiajs/react';

export type ApprovalsIndexQuery = {
    search?: string;
    page?: number | string | null;
};

function buildQuery(
    params: Record<string, string | number | null | undefined> = {},
): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        const normalized = String(value).trim();

        if (normalized.length === 0) {
            return;
        }

        search.set(key, normalized);
    });

    const query = search.toString();

    return query ? `?${query}` : '';
}

function asHref(url: string): NonNullable<InertiaLinkProps['href']> {
    return url;
}

export const approvalRoutes = {
    index: (query: ApprovalsIndexQuery = {}) =>
        asHref(
            `/approvals${buildQuery({
                search: query.search,
                page: query.page,
            })}`,
        ),
    indexUrl: (query: ApprovalsIndexQuery = {}): string =>
        `/approvals${buildQuery({
            search: query.search,
            page: query.page,
        })}`,
} as const;
