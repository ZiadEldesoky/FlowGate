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
import {
    getPurchaseRequestActionLabel,
    getPurchaseRequestDecisionLabel,
    getPurchaseRequestStageLabel,
} from '@/features/purchase-requests/i18n';
import {
    formatDate,
    formatDateTime,
    formatMoney,
} from '@/features/purchase-requests/utils';
import { getPresentationStatusLabel } from '@/lib/status';
import type { AppLocale } from '@/types/locale';
import type { PurchaseRequestDetail } from '@/types/purchase-request';

type RequestDetailSectionsProps = {
    purchaseRequest: PurchaseRequestDetail;
    locale: AppLocale;
    labels: PurchaseRequestCopy;
};

export function RequestSummarySection({
    purchaseRequest,
    locale,
    labels,
}: RequestDetailSectionsProps) {
    return (
        <section className="grid gap-4 rounded-md border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.reference}
                </p>
                <p className="font-medium">{purchaseRequest.reference}</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.status}
                </p>
                <StatusBadge
                    status={purchaseRequest.status}
                    locale={locale}
                    showDescription
                />
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.serverTotal}
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatMoney(
                        purchaseRequest.totalAmount,
                        purchaseRequest.currency,
                        locale,
                    )}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.requester}
                </p>
                <p>{purchaseRequest.requester.name}</p>
                <p className="text-xs text-muted-foreground">
                    {purchaseRequest.requester.email}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.department}
                </p>
                <p>{purchaseRequest.department.name}</p>
                <p className="text-xs text-muted-foreground">
                    {purchaseRequest.department.code}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.neededBy}
                </p>
                <p>
                    {formatDate(purchaseRequest.neededBy, locale) ??
                        labels.notAvailable}
                </p>
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.justification}
                </p>
                <p className="text-sm leading-6 whitespace-pre-wrap text-foreground">
                    {purchaseRequest.justification}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.createdAt}
                </p>
                <p className="text-sm">
                    {formatDateTime(purchaseRequest.createdAt, locale) ??
                        labels.notAvailable}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.submittedAt}
                </p>
                <p className="text-sm">
                    {formatDateTime(purchaseRequest.submittedAt, locale) ??
                        labels.notAvailable}
                </p>
            </div>
        </section>
    );
}

export function RequestItemsSection({
    purchaseRequest,
    locale,
    labels,
}: RequestDetailSectionsProps) {
    return (
        <section className="overflow-hidden rounded-md border bg-card">
            <div className="border-b px-4 py-3">
                <h2 className="text-sm font-medium">{labels.items}</h2>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{labels.itemDescription}</TableHead>
                        <TableHead>{labels.sku}</TableHead>
                        <TableHead className="text-end">
                            {labels.quantity}
                        </TableHead>
                        <TableHead className="text-end">
                            {labels.unitPrice}
                        </TableHead>
                        <TableHead className="text-end">
                            {labels.lineTotal}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchaseRequest.items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="text-muted-foreground">
                                {item.position}
                            </TableCell>
                            <TableCell className="max-w-[18rem] whitespace-normal">
                                {item.description}
                            </TableCell>
                            <TableCell>
                                {item.sku ?? labels.notAvailable}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs tabular-nums">
                                {item.quantity}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs tabular-nums">
                                {formatMoney(
                                    item.unitPrice,
                                    purchaseRequest.currency,
                                    locale,
                                )}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs tabular-nums">
                                {formatMoney(
                                    item.lineTotal,
                                    purchaseRequest.currency,
                                    locale,
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                    {labels.serverTotal}
                </span>
                <span className="font-mono font-semibold tabular-nums">
                    {formatMoney(
                        purchaseRequest.totalAmount,
                        purchaseRequest.currency,
                        locale,
                    )}
                </span>
            </div>
        </section>
    );
}

export function RequestApprovalsSection({
    purchaseRequest,
    locale,
    labels,
}: RequestDetailSectionsProps) {
    return (
        <section className="overflow-hidden rounded-md border bg-card">
            <div className="border-b px-4 py-3">
                <h2 className="text-sm font-medium">{labels.approvals}</h2>
            </div>
            {purchaseRequest.approvals.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                    {labels.noApprovals}
                </p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{labels.stage}</TableHead>
                            <TableHead>{labels.decision}</TableHead>
                            <TableHead>{labels.actor}</TableHead>
                            <TableHead>{labels.comment}</TableHead>
                            <TableHead>{labels.decidedAt}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseRequest.approvals.map((approval) => (
                            <TableRow key={approval.id}>
                                <TableCell>
                                    {getPurchaseRequestStageLabel(
                                        approval.stage,
                                        locale,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {getPurchaseRequestDecisionLabel(
                                        approval.decision,
                                        locale,
                                    )}
                                </TableCell>
                                <TableCell>{approval.actor.name}</TableCell>
                                <TableCell className="max-w-[16rem] whitespace-normal">
                                    {approval.comment ?? labels.notAvailable}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDateTime(approval.decidedAt, locale)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    );
}

export function RequestActivitySection({
    purchaseRequest,
    locale,
    labels,
}: RequestDetailSectionsProps) {
    return (
        <section className="overflow-hidden rounded-md border bg-card">
            <div className="border-b px-4 py-3">
                <h2 className="text-sm font-medium">{labels.activity}</h2>
            </div>
            {purchaseRequest.activity.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                    {labels.noActivity}
                </p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{labels.action}</TableHead>
                            <TableHead>{labels.fromStatus}</TableHead>
                            <TableHead>{labels.toStatus}</TableHead>
                            <TableHead>{labels.actor}</TableHead>
                            <TableHead>{labels.comment}</TableHead>
                            <TableHead>{labels.createdAt}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseRequest.activity.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell>
                                    {getPurchaseRequestActionLabel(
                                        entry.action,
                                        locale,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {entry.fromStatus
                                        ? getPresentationStatusLabel(
                                              entry.fromStatus,
                                              locale,
                                          )
                                        : labels.notAvailable}
                                </TableCell>
                                <TableCell>
                                    {getPresentationStatusLabel(
                                        entry.toStatus,
                                        locale,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {entry.actor?.name ?? labels.notAvailable}
                                </TableCell>
                                <TableCell className="max-w-[16rem] whitespace-normal">
                                    {entry.comment ?? labels.notAvailable}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDateTime(entry.createdAt, locale)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    );
}
