import { Head, router } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
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
    ApprovalsQueueTable,
    approvalRoutes,
    formatApprovalsCopy,
    getApprovalStageLabel,
    getApprovalsCopy,
} from '@/features/approvals';
import { useDirection } from '@/hooks/use-direction';
import type { ApprovalsIndexProps } from '@/types/approvals';

export default function ApprovalsIndex({
    reviews,
    filters,
    stage,
}: ApprovalsIndexProps) {
    const { locale } = useDirection();
    const t = getApprovalsCopy(locale);
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (nextSearch = search): void => {
        router.get(
            approvalRoutes.indexUrl({
                search: nextSearch,
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
            approvalRoutes.indexUrl(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const rows = reviews.data;
    const meta = reviews.meta;
    const links = reviews.links;

    return (
        <>
            <Head title={t.indexTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.indexTitle}
                    description={t.indexDescription}
                    meta={
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {t.stageLabel}:
                            </span>{' '}
                            {getApprovalStageLabel(stage, locale)}
                        </p>
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
                    <FilterField label={t.search} htmlFor="approvals-search">
                        <Input
                            id="approvals-search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    applyFilters(event.currentTarget.value);
                                }
                            }}
                            placeholder={t.searchPlaceholder}
                            autoComplete="off"
                        />
                    </FilterField>
                </FilterBar>

                <div className="overflow-hidden rounded-md border bg-card">
                    {rows.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title={t.emptyTitle}
                                description={t.emptyDescription}
                            />
                        </div>
                    ) : (
                        <>
                            <ApprovalsQueueTable
                                rows={rows}
                                locale={locale}
                                labels={t}
                            />
                            <div className="flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">
                                    {meta.total === 0
                                        ? t.noResultsRange
                                        : formatApprovalsCopy(t.showing, {
                                              from: meta.from,
                                              to: meta.to,
                                              total: meta.total,
                                          })}
                                    <span className="mx-2" aria-hidden>
                                        ·
                                    </span>
                                    {formatApprovalsCopy(t.pageOf, {
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

ApprovalsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Approvals',
            href: approvalRoutes.index(),
        },
    ],
};
