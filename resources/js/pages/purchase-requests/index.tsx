import { Head, Link, router } from '@inertiajs/react';
import { Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
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
import {
    PurchaseRequestTable,
    formatCopy,
    getPurchaseRequestCopy,
    purchaseRequestRoutes,
} from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import { getPresentationStatusLabel } from '@/lib/status';
import type { PurchaseRequestIndexProps } from '@/types/purchase-request';

export default function PurchaseRequestsIndex({
    purchaseRequests,
    filters,
    statuses,
    can,
}: PurchaseRequestIndexProps) {
    const { locale } = useDirection();
    const t = getPurchaseRequestCopy(locale);
    const [search, setSearch] = useState(filters.search ?? '');
    const selectedStatus = filters.status ?? 'all';

    const applyFilters = (next?: {
        search?: string;
        status?: string | null;
    }): void => {
        const nextSearch = next?.search ?? search;
        const nextStatus =
            next && 'status' in next ? next.status : selectedStatus;

        router.get(
            purchaseRequestRoutes.index({
                search: nextSearch,
                status: !nextStatus || nextStatus === 'all' ? null : nextStatus,
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = (): void => {
        setSearch('');
        router.get(
            purchaseRequestRoutes.index(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const rows = purchaseRequests.data;
    const meta = purchaseRequests.meta;
    const links = purchaseRequests.links;

    return (
        <>
            <Head title={t.indexTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.indexTitle}
                    description={t.indexDescription}
                    actions={
                        can.create ? (
                            <Button asChild size="sm">
                                <Link href={purchaseRequestRoutes.create()}>
                                    <Plus className="size-4" />
                                    {t.newRequest}
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <FilterBar
                    actions={
                        <>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => applyFilters()}
                            >
                                <Search className="size-4" />
                                {t.search}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                <Filter className="size-4" />
                                {t.clearFilters}
                            </Button>
                        </>
                    }
                >
                    <FilterField label={t.search} htmlFor="pr-search">
                        <Input
                            id="pr-search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    applyFilters({
                                        search: event.currentTarget.value,
                                    });
                                }
                            }}
                            placeholder={t.searchPlaceholder}
                            autoComplete="off"
                        />
                    </FilterField>
                    <FilterField label={t.status} htmlFor="pr-status">
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) =>
                                applyFilters({ status: value })
                            }
                        >
                            <SelectTrigger
                                id="pr-status"
                                className="w-full min-w-[12rem]"
                            >
                                <SelectValue placeholder={t.allStatuses} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t.allStatuses}
                                </SelectItem>
                                {statuses.map((value) => (
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
                </FilterBar>

                <div className="overflow-hidden rounded-md border bg-card">
                    {rows.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title={t.emptyTitle}
                                description={t.emptyDescription}
                                action={
                                    can.create ? (
                                        <Button asChild size="sm">
                                            <Link
                                                href={purchaseRequestRoutes.create()}
                                            >
                                                <Plus className="size-4" />
                                                {t.newRequest}
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <PurchaseRequestTable
                                rows={rows}
                                locale={locale}
                                labels={t}
                            />
                            <div className="flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">
                                    {meta.total === 0
                                        ? t.noResultsRange
                                        : formatCopy(t.showing, {
                                              from: meta.from,
                                              to: meta.to,
                                              total: meta.total,
                                          })}
                                    <span className="mx-2" aria-hidden>
                                        ·
                                    </span>
                                    {formatCopy(t.pageOf, {
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
                </div>
            </div>
        </>
    );
}

PurchaseRequestsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Purchase requests',
            href: purchaseRequestRoutes.index(),
        },
    ],
};
