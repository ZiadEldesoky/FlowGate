/**
 * Thin frontend accessors over generated Wayfinder helpers for purchase
 * request intake and decision routes.
 *
 * Generated artifacts live in resources/js/routes (gitignored).
 * Run: php artisan wayfinder:generate --with-form
 */
import type { InertiaLinkProps } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';
import {
    approveManagerReview as approveManagerReviewRoute,
    approveProcurementReview as approveProcurementReviewRoute,
    create as createRoute,
    edit as editRoute,
    index as indexRoute,
    reject as rejectRoute,
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
    approveManagerReview: (purchaseRequestId: number | string) =>
        asHref(approveManagerReviewRoute(purchaseRequestId)),
    approveManagerReviewUrl: (purchaseRequestId: number | string): string =>
        toUrl(approveManagerReviewRoute(purchaseRequestId)),
    approveProcurementReview: (purchaseRequestId: number | string) =>
        asHref(approveProcurementReviewRoute(purchaseRequestId)),
    approveProcurementReviewUrl: (purchaseRequestId: number | string): string =>
        toUrl(approveProcurementReviewRoute(purchaseRequestId)),
    reject: (purchaseRequestId: number | string) =>
        asHref(rejectRoute(purchaseRequestId)),
    rejectUrl: (purchaseRequestId: number | string): string =>
        toUrl(rejectRoute(purchaseRequestId)),
} as const;
