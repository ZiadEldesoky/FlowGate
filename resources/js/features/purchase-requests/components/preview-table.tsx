import { StatusBadge } from '@/components/ui/status-badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { AppLocale } from '@/types/locale';
import type { PurchaseRequestPreviewRow } from '../preview-data';

type PurchaseRequestPreviewTableProps = {
    rows: PurchaseRequestPreviewRow[];
    locale: AppLocale;
    labels: {
        reference: string;
        title: string;
        requester: string;
        department: string;
        status: string;
        amount: string;
        submittedAt: string;
    };
};

export function PurchaseRequestPreviewTable({
    rows,
    locale,
    labels,
}: PurchaseRequestPreviewTableProps) {
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
                            {row.reference}
                        </TableCell>
                        <TableCell className="max-w-[16rem] truncate">
                            {row.title[locale]}
                        </TableCell>
                        <TableCell>{row.requester[locale]}</TableCell>
                        <TableCell>{row.department[locale]}</TableCell>
                        <TableCell>
                            <StatusBadge status={row.status} locale={locale} />
                        </TableCell>
                        <TableCell className="text-end font-mono text-xs tabular-nums">
                            {row.amountPreview}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {row.submittedAt}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
