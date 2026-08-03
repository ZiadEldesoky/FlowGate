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
import type { ApprovalsCopy } from '@/features/approvals/i18n';
import {
    ReviewSla,
    formatDate,
    formatDateTime,
    formatMoney,
    purchaseRequestRoutes,
} from '@/features/purchase-requests';
import type { ApprovalQueueItem } from '@/types/approvals';
import type { AppLocale } from '@/types/locale';

type ApprovalsQueueTableProps = {
    rows: ApprovalQueueItem[];
    locale: AppLocale;
    labels: ApprovalsCopy;
};

export function ApprovalsQueueTable({
    rows,
    locale,
    labels,
}: ApprovalsQueueTableProps) {
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
                    <TableHead>{labels.neededBy}</TableHead>
                    <TableHead>{labels.reviewDueAt}</TableHead>
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
                            {formatMoney(row.totalAmount, row.currency, locale)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {formatDate(row.neededBy, locale) ??
                                labels.notAvailable}
                        </TableCell>
                        <TableCell>
                            <ReviewSla
                                reviewDueAt={row.reviewDueAt}
                                isOverdue={row.isOverdue}
                                locale={locale}
                                labels={{
                                    reviewDueAt: labels.reviewDueAt,
                                    overdue: labels.overdue,
                                    due: labels.due,
                                    notAvailable: labels.notAvailable,
                                }}
                            />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {formatDateTime(row.submittedAt, locale) ??
                                labels.notAvailable}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
