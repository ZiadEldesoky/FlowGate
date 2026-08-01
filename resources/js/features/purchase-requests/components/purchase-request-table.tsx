import { Link } from '@inertiajs/react';
import { StatusBadge } from '@/components/ui/status-badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PurchaseRequestCopy } from '@/features/purchase-requests/i18n';
import { purchaseRequestRoutes } from '@/features/purchase-requests/routes';
import type { AppLocale } from '@/types/locale';
import type { PurchaseRequestListItem } from '@/types/purchase-request';

type PurchaseRequestTableProps = {
    rows: PurchaseRequestListItem[];
    locale: AppLocale;
    labels: PurchaseRequestCopy;
};

export function PurchaseRequestTable({
    rows,
    locale,
    labels,
}: PurchaseRequestTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{labels.reference}</TableHead>
                    <TableHead>{labels.title}</TableHead>
                    <TableHead>{labels.requester}</TableHead>
                    <TableHead>{labels.department}</TableHead>
                    <TableHead>{labels.status}</TableHead>
                    <TableHead className="text-end">{labels.amount}</TableHead>
                    <TableHead>{labels.submittedAt}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell className="font-medium">
                            <Link
                                href={purchaseRequestRoutes.show(row.id)}
                                className="text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                                prefetch
                            >
                                {row.reference}
                            </Link>
                        </TableCell>
                        <TableCell className="max-w-[16rem] truncate">
                            <Link
                                href={purchaseRequestRoutes.show(row.id)}
                                className="hover:underline"
                                prefetch
                            >
                                {row.title}
                            </Link>
                        </TableCell>
                        <TableCell>{row.requester.name}</TableCell>
                        <TableCell>
                            <span className="block">{row.department.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {row.department.code}
                            </span>
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={row.status} locale={locale} />
                        </TableCell>
                        <TableCell className="text-end font-mono text-xs tabular-nums">
                            {row.currency} {row.totalAmount}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {row.submittedAt ?? labels.notAvailable}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
