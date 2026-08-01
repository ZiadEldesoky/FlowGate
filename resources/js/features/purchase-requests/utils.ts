import type { PurchaseRequestFormItem } from '@/types/purchase-request';

export const MAX_PURCHASE_REQUEST_ITEMS = 25;
export const MIN_PURCHASE_REQUEST_ITEMS = 1;

export function createEmptyItem(): PurchaseRequestFormItem {
    return {
        description: '',
        sku: null,
        quantity: '1',
        unit_price: '0',
    };
}

export function toDateInputValue(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    // Accept already-normalized YYYY-MM-DD or ISO timestamps.
    return value.slice(0, 10);
}

export function parseDecimal(value: string | null | undefined): number {
    if (!value) {
        return 0;
    }

    const normalized = value.replaceAll(',', '').trim();
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Preview-only client estimate. Never submit this as the authoritative total.
 */
export function estimateItemsTotal(items: PurchaseRequestFormItem[]): number {
    return items.reduce((sum, item) => {
        return (
            sum + parseDecimal(item.quantity) * parseDecimal(item.unit_price)
        );
    }, 0);
}

export function formatEstimate(
    amount: number,
    currency: string,
    locale: 'ar' | 'en',
): string {
    try {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

export function nestedError(
    errors: Partial<Record<string, string>>,
    key: string,
): string | undefined {
    return errors[key];
}
