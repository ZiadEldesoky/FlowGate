import { parseDecimal } from '@/features/purchase-requests';
import type { AppLocale } from '@/types/locale';
import type { ProcurementMonthlyTrendItem } from '@/types/reports';

export function maxTrendAmount(items: ProcurementMonthlyTrendItem[]): number {
    return items.reduce((max, item) => {
        return Math.max(max, parseDecimal(item.totalAmount));
    }, 0);
}

export function trendBarWidth(amount: string, maxAmount: number): number {
    if (maxAmount <= 0) {
        return 0;
    }

    const value = parseDecimal(amount);

    if (value <= 0) {
        return 0;
    }

    return Math.max(2, Math.min(100, (value / maxAmount) * 100));
}

export function statusBarWidth(count: number, maxCount: number): number {
    if (count <= 0 || maxCount <= 0) {
        return 0;
    }

    return Math.max(2, Math.min(100, (count / maxCount) * 100));
}

/**
 * Presentation-only percentage formatting for authoritative backend rates.
 * Accepts values like "50.00" or 50.
 */
export function formatPercent(
    value: string | number,
    locale: AppLocale,
): string {
    const parsed =
        typeof value === 'number' ? value : Number(String(value).trim());

    if (!Number.isFinite(parsed)) {
        return String(value);
    }

    try {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(parsed / 100);
    } catch {
        return `${parsed}%`;
    }
}
