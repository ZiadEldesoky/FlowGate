import { parseDecimal } from '@/features/purchase-requests';
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

    return Math.max(0, Math.min(100, (value / maxAmount) * 100));
}
