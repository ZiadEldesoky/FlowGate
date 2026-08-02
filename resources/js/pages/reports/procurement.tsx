import { Head, router, usePage } from '@inertiajs/react';
import { Download, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar, FilterField } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    formatMoney,
    getPurchaseRequestCopy,
    PurchaseRequestTable,
} from '@/features/purchase-requests';
import {
    formatPercent,
    formatReportsCopy,
    getReportingScopeLabel,
    getReportsCopy,
    KpiStrip,
    MonthlyTrend,
    reportRoutes,
} from '@/features/reports';
import { useDirection } from '@/hooks/use-direction';
import { getPresentationStatusLabel } from '@/lib/status';
import type { ProcurementReportPageProps } from '@/types/reports';

const ALL = 'all';

export default function ProcurementReportPage({
    scope,
    filters,
    filterOptions,
    summary,
    statusBreakdown,
    departmentBreakdown,
    monthlyTrend,
    purchaseRequests,
}: ProcurementReportPageProps) {
    const { locale } = useDirection();
    const t = getReportsCopy(locale);
    const purchaseCopy = getPurchaseRequestCopy(locale);

    const page = usePage();
    const errors = (page.props.errors ?? {}) as Partial<
        Record<'from' | 'to' | 'status' | 'department_id', string>
    >;
    const hasFilterErrors = Boolean(
        errors.from || errors.to || errors.status || errors.department_id,
    );

    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [status, setStatus] = useState<string>(filters.status ?? ALL);
    const [departmentId, setDepartmentId] = useState<string>(
        filters.departmentId == null ? ALL : String(filters.departmentId),
    );
    const [isFiltering, setIsFiltering] = useState(false);

    const applyFilters = (next?: {
        from?: string;
        to?: string;
        status?: string;
        departmentId?: string;
    }): void => {
        const nextFrom = next?.from ?? from;
        const nextTo = next?.to ?? to;
        const nextStatus = next?.status ?? status;
        const nextDepartment = next?.departmentId ?? departmentId;

        router.get(
            reportRoutes.procurement.indexUrl({
                from: nextFrom || null,
                to: nextTo || null,
                status: nextStatus === ALL ? null : nextStatus,
                departmentId:
                    nextDepartment === ALL ? null : Number(nextDepartment),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsFiltering(true),
                onFinish: () => setIsFiltering(false),
            },
        );
    };

    const clearFilters = (): void => {
        router.get(
            reportRoutes.procurement.indexUrl(),
            {},
            {
                preserveState: false,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsFiltering(true),
                onFinish: () => setIsFiltering(false),
            },
        );
    };

    const exportHref = reportRoutes.procurement.exportUrl({
        from: from || null,
        to: to || null,
        status: status === ALL ? null : status,
        departmentId: departmentId === ALL ? null : Number(departmentId),
    });

    const rows = purchaseRequests.data;
    const meta = purchaseRequests.meta;
    const links = purchaseRequests.links;

    return (
        <>
            <Head title={t.procurementTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.procurementTitle}
                    description={t.procurementDescription}
                    meta={
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {t.scopeLabel}:
                            </span>{' '}
                            {getReportingScopeLabel(scope, locale)}
                        </p>
                    }
                    actions={
                        <Button asChild size="sm" variant="outline">
                            <a href={exportHref}>
                                <Download className="size-4" />
                                {t.exportCsv}
                            </a>
                        </Button>
                    }
                />

                {hasFilterErrors ? (
                    <Alert variant="destructive" role="alert">
                        <AlertTitle>{t.filterErrorsTitle}</AlertTitle>
                        <AlertDescription>
                            <div className="space-y-1">
                                <p>{t.filterErrorsDescription}</p>
                                {errors.from ? <p>{errors.from}</p> : null}
                                {errors.to ? <p>{errors.to}</p> : null}
                                {errors.status ? <p>{errors.status}</p> : null}
                                {errors.department_id ? (
                                    <p>{errors.department_id}</p>
                                ) : null}
                            </div>
                        </AlertDescription>
                    </Alert>
                ) : null}

                <FilterBar
                    actions={
                        <>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => applyFilters()}
                                disabled={isFiltering}
                            >
                                {isFiltering ? (
                                    <Spinner />
                                ) : (
                                    <Search className="size-4" />
                                )}
                                {isFiltering
                                    ? t.applyingFilters
                                    : t.applyFilters}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                disabled={isFiltering}
                            >
                                <Filter className="size-4" />
                                {t.clearFilters}
                            </Button>
                        </>
                    }
                >
                    <FilterField label={t.from} htmlFor="report-from">
                        <Input
                            id="report-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                            disabled={isFiltering}
                        />
                    </FilterField>
                    <FilterField label={t.to} htmlFor="report-to">
                        <Input
                            id="report-to"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                            disabled={isFiltering}
                        />
                    </FilterField>
                    <FilterField label={t.status} htmlFor="report-status">
                        <Select
                            value={status}
                            onValueChange={(value) => {
                                setStatus(value);
                                applyFilters({ status: value });
                            }}
                            disabled={isFiltering}
                        >
                            <SelectTrigger
                                id="report-status"
                                className="w-full min-w-[11rem]"
                            >
                                <SelectValue placeholder={t.allStatuses} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>
                                    {t.allStatuses}
                                </SelectItem>
                                {filterOptions.statuses.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {getPresentationStatusLabel(
                                            value,
                                            locale,
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterField>
                    <FilterField
                        label={t.department}
                        htmlFor="report-department"
                    >
                        <Select
                            value={departmentId}
                            onValueChange={(value) => {
                                setDepartmentId(value);
                                applyFilters({ departmentId: value });
                            }}
                            disabled={isFiltering}
                        >
                            <SelectTrigger
                                id="report-department"
                                className="w-full min-w-[12rem]"
                            >
                                <SelectValue placeholder={t.allDepartments} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>
                                    {t.allDepartments}
                                </SelectItem>
                                {filterOptions.departments.map((department) => (
                                    <SelectItem
                                        key={department.id}
                                        value={String(department.id)}
                                    >
                                        {department.name} ({department.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterField>
                </FilterBar>

                <KpiStrip
                    items={[
                        {
                            key: 'requests',
                            label: t.requestCount,
                            value: summary.requestCount,
                        },
                        {
                            key: 'total',
                            label: t.totalAmount,
                            value: formatMoney(
                                summary.totalAmount,
                                summary.currency,
                                locale,
                            ),
                        },
                        {
                            key: 'average',
                            label: t.averageAmount,
                            value: formatMoney(
                                summary.averageAmount,
                                summary.currency,
                                locale,
                            ),
                        },
                        {
                            key: 'completed',
                            label: t.completedCount,
                            value: summary.completedCount,
                        },
                        {
                            key: 'rate',
                            label: t.completionRate,
                            value: formatPercent(
                                summary.completionRate,
                                locale,
                            ),
                        },
                    ]}
                />

                <div className="grid gap-4 xl:grid-cols-2">
                    <section className="rounded-md border bg-card p-4">
                        <h2 className="mb-3 text-sm font-medium">
                            {t.byStatus}
                        </h2>
                        {statusBreakdown.length === 0 ? (
                            <p className="py-6 text-sm text-muted-foreground">
                                {t.emptyBreakdown}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.status}</TableHead>
                                            <TableHead className="text-end">
                                                {t.count}
                                            </TableHead>
                                            <TableHead className="text-end">
                                                {t.amount}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {statusBreakdown.map((item) => (
                                            <TableRow key={item.status}>
                                                <TableCell>
                                                    {getPresentationStatusLabel(
                                                        item.status,
                                                        locale,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-end tabular-nums">
                                                    {item.requestCount}
                                                </TableCell>
                                                <TableCell className="text-end font-mono text-xs tabular-nums">
                                                    {formatMoney(
                                                        item.totalAmount,
                                                        summary.currency,
                                                        locale,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </section>

                    <section className="rounded-md border bg-card p-4">
                        <h2 className="mb-3 text-sm font-medium">
                            {t.byDepartment}
                        </h2>
                        {departmentBreakdown.length === 0 ? (
                            <p className="py-6 text-sm text-muted-foreground">
                                {t.emptyBreakdown}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t.department}
                                            </TableHead>
                                            <TableHead className="text-end">
                                                {t.count}
                                            </TableHead>
                                            <TableHead className="text-end">
                                                {t.amount}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {departmentBreakdown.map((item) => (
                                            <TableRow key={item.department.id}>
                                                <TableCell>
                                                    <span className="block font-medium">
                                                        {item.department.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.department.code}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-end tabular-nums">
                                                    {item.requestCount}
                                                </TableCell>
                                                <TableCell className="text-end font-mono text-xs tabular-nums">
                                                    {formatMoney(
                                                        item.totalAmount,
                                                        summary.currency,
                                                        locale,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </section>
                </div>

                <section className="overflow-hidden rounded-md border bg-card">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-sm font-medium">
                            {t.monthlyTrend}
                        </h2>
                    </div>
                    <div className="p-2 sm:p-4">
                        <MonthlyTrend
                            items={monthlyTrend}
                            locale={locale}
                            currency={summary.currency}
                            labels={{
                                month: t.month,
                                count: t.count,
                                amount: t.amount,
                                empty: t.emptyTrend,
                            }}
                        />
                    </div>
                </section>

                <section className="overflow-hidden rounded-md border bg-card">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-sm font-medium">{t.detailTable}</h2>
                    </div>
                    {rows.length === 0 ? (
                        <div className="p-4">
                            <EmptyState title={t.emptyTable} />
                        </div>
                    ) : (
                        <>
                            <PurchaseRequestTable
                                rows={rows}
                                locale={locale}
                                labels={purchaseCopy}
                            />
                            <div className="flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">
                                    {meta.total === 0
                                        ? t.noResultsRange
                                        : formatReportsCopy(t.showing, {
                                              from: meta.from,
                                              to: meta.to,
                                              total: meta.total,
                                          })}
                                    <span className="mx-2" aria-hidden>
                                        ·
                                    </span>
                                    {formatReportsCopy(t.pageOf, {
                                        current: meta.currentPage,
                                        last: meta.lastPage,
                                    })}
                                </p>
                                <Pagination className="mx-0 w-auto justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            {links.previous ? (
                                                <PaginationPrevious
                                                    label={t.previous}
                                                    onClick={() =>
                                                        router.get(
                                                            links.previous!,
                                                            {},
                                                            {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <PaginationPrevious
                                                    label={t.previous}
                                                    disabled
                                                />
                                            )}
                                        </PaginationItem>
                                        <PaginationItem>
                                            {links.next ? (
                                                <PaginationNext
                                                    label={t.next}
                                                    onClick={() =>
                                                        router.get(
                                                            links.next!,
                                                            {},
                                                            {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <PaginationNext
                                                    label={t.next}
                                                    disabled
                                                />
                                            )}
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </>
    );
}

ProcurementReportPage.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: reportRoutes.procurement.index(),
        },
        {
            title: 'Procurement',
            href: reportRoutes.procurement.index(),
        },
    ],
};
