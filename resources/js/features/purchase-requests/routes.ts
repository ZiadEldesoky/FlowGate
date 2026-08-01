/**
 * Frontend accessors over generated Wayfinder helpers, with temporary
 * builders for Phase 03 decision routes until backend Wayfinder generation
 * includes them.
 *
 * Generated artifacts live in resources/js/routes (gitignored).
 * Run: php artisan wayfinder:generate --with-form
 */
import type { InertiaLinkProps } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';
import {
    create as createRoute,
    edit as editRoute,
    index as indexRoute,
    show as showRoute,
    store as storeRoute,
    submit as submitRoute,
    update as updateRoute,
} from '@/routes/purchase-requests';

export type PurchaseRequestIndexQuery = {
    search?: string;
    status?: string | null;
    page?: number | string | null;
};

function compactQuery(
    query: PurchaseRequestIndexQuery = {},
): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (query.search && query.search.trim().length > 0) {
        params.search = query.search.trim();
    }

    if (query.status && query.status !== 'all') {
        params.status = query.status;
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

/**
 * Temporary decision route builders. Replace with generated helpers once
 * approve/reject routes exist in Wayfinder output.
 */
const decisionPaths = {
    approveManagerReview: (id: number | string): string =>
        `/purchase-requests/${id}/approve-manager-review`,
    approveProcurementReview: (id: number | string): string =>
        `/purchase-requests/${id}/approve-procurement-review`,
    reject: (id: number | string): string => `/purchase-requests/${id}/reject`,
} as const;

export const purchaseRequestRoutes = {
    index: (query: PurchaseRequestIndexQuery = {}) => {
        const params = compactQuery(query);

        return asHref(
            indexRoute(
                Object.keys(params).length > 0 ? { query: params } : undefined,
            ),
        );
    },
    indexUrl: (query: PurchaseRequestIndexQuery = {}): string =>
        toUrl(purchaseRequestRoutes.index(query)),
    create: () => asHref(createRoute()),
    createUrl: (): string => toUrl(createRoute()),
    store: () => asHref(storeRoute()),
    storeUrl: (): string => toUrl(storeRoute()),
    show: (purchaseRequestId: number | string) =>
        asHref(showRoute(purchaseRequestId)),
    showUrl: (purchaseRequestId: number | string): string =>
        toUrl(showRoute(purchaseRequestId)),
    edit: (purchaseRequestId: number | string) =>
        asHref(editRoute(purchaseRequestId)),
    editUrl: (purchaseRequestId: number | string): string =>
        toUrl(editRoute(purchaseRequestId)),
    update: (purchaseRequestId: number | string) =>
        asHref(updateRoute(purchaseRequestId)),
    updateUrl: (purchaseRequestId: number | string): string =>
        toUrl(updateRoute(purchaseRequestId)),
    submit: (purchaseRequestId: number | string) =>
        asHref(submitRoute(purchaseRequestId)),
    submitUrl: (purchaseRequestId: number | string): string =>
        toUrl(submitRoute(purchaseRequestId)),
    approveManagerReviewUrl: (purchaseRequestId: number | string): string =>
        decisionPaths.approveManagerReview(purchaseRequestId),
    approveProcurementReviewUrl: (purchaseRequestId: number | string): string =>
        decisionPaths.approveProcurementReview(purchaseRequestId),
    rejectUrl: (purchaseRequestId: number | string): string =>
        decisionPaths.reject(purchaseRequestId),
} as const;
