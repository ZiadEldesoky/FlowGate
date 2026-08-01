/**
 * Temporary URL builders for the purchase-request intake slice.
 * Root will replace/verify these against generated Wayfinder routes on integration.
 * Keep all path construction here — do not scatter route strings across pages.
 */

type QueryValue = string | number | null | undefined;

export type PurchaseRequestIndexQuery = {
    search?: string;
    status?: string | null;
    page?: number | string | null;
};

function buildQuery(params: Record<string, QueryValue> = {}): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        const normalized = String(value).trim();

        if (normalized.length === 0 || normalized === 'all') {
            return;
        }

        search.set(key, normalized);
    });

    const query = search.toString();

    return query ? `?${query}` : '';
}

export const purchaseRequestRoutes = {
    index: (query: PurchaseRequestIndexQuery = {}): string =>
        `/purchase-requests${buildQuery({
            search: query.search,
            status: query.status,
            page: query.page,
        })}`,
    create: (): string => '/purchase-requests/create',
    store: (): string => '/purchase-requests',
    show: (id: number | string): string => `/purchase-requests/${id}`,
    edit: (id: number | string): string => `/purchase-requests/${id}/edit`,
    update: (id: number | string): string => `/purchase-requests/${id}`,
    submit: (id: number | string): string => `/purchase-requests/${id}/submit`,
} as const;
