import type { AppLocale } from '@/types/locale';
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

const intlLocale = (locale: AppLocale): string =>
    locale === 'ar' ? 'ar-EG' : 'en-EG';

export function formatMoney(
    amount: string,
    currency: string,
    locale: AppLocale,
): string {
    const normalized = amount.replaceAll(',', '').trim();
    const parsed = Number(normalized);

    if (!Number.isFinite(parsed)) {
        return `${currency} ${amount}`;
    }

    try {
        return new Intl.NumberFormat(intlLocale(locale), {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parsed);
    } catch {
        return `${currency} ${amount}`;
    }
}

function dateValue(value: string): Date | null {
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T00:00:00`
        : value;
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
    value: string | null | undefined,
    locale: AppLocale,
): string | null {
    if (!value) {
        return null;
    }

    const date = dateValue(value);

    if (!date) {
        return value;
    }

    return new Intl.DateTimeFormat(intlLocale(locale), {
        dateStyle: 'medium',
    }).format(date);
}

export function formatDateTime(
    value: string | null | undefined,
    locale: AppLocale,
): string | null {
    if (!value) {
        return null;
    }

    const date = dateValue(value);

    if (!date) {
        return value;
    }

    return new Intl.DateTimeFormat(intlLocale(locale), {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
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
        return new Intl.NumberFormat(intlLocale(locale), {
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
