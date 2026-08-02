/**
 * Thin frontend accessors over generated Wayfinder helpers for reporting.
 * Generated artifacts live in resources/js/routes (gitignored).
 * Run: php artisan wayfinder:generate --with-form
 */
import type { InertiaLinkProps } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';
import {
    exportMethod as exportRoute,
    index as indexRoute,
} from '@/routes/reports/procurement';
import type { PurchaseRequestStatus } from '@/types/purchase-request';

export type ProcurementReportQuery = {
    from?: string | null;
    to?: string | null;
    status?: PurchaseRequestStatus | string | null;
    departmentId?: number | string | null;
    page?: number | string | null;
};

function compactQuery(
    params: Record<string, string | number | null | undefined>,
): Record<string, string | number> {
    const result: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        const normalized = String(value).trim();

        if (normalized.length === 0 || normalized === 'all') {
            return;
        }

        result[key] = typeof value === 'number' ? value : normalized;
    });

    return result;
}

function asHref(
    definition: NonNullable<InertiaLinkProps['href']>,
): NonNullable<InertiaLinkProps['href']> {
    return definition;
}

function withQuery(
    query: Record<string, string | number>,
): { query: Record<string, string | number> } | undefined {
    return Object.keys(query).length > 0 ? { query } : undefined;
}

function reportQuery(query: ProcurementReportQuery = {}) {
    return compactQuery({
        from: query.from,
        to: query.to,
        status: query.status,
        department_id: query.departmentId,
        page: query.page,
    });
}

export const reportRoutes = {
    procurement: {
        index: (query: ProcurementReportQuery = {}) =>
            asHref(indexRoute(withQuery(reportQuery(query)))),
        indexUrl: (query: ProcurementReportQuery = {}): string =>
            toUrl(reportRoutes.procurement.index(query)),
        export: (query: ProcurementReportQuery = {}) =>
            asHref(exportRoute(withQuery(reportQuery(query)))),
        exportUrl: (query: ProcurementReportQuery = {}): string =>
            toUrl(reportRoutes.procurement.export(query)),
    },
} as const;
