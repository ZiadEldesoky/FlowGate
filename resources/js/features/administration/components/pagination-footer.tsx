import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { formatAdministrationCopy } from '@/features/administration/i18n';
import type { AdministrationCopy } from '@/features/administration/i18n';
import type {
    AdministrationPaginationLinks,
    AdministrationPaginationMeta,
} from '@/types/administration';

type PaginationFooterProps = {
    meta: AdministrationPaginationMeta;
    links: AdministrationPaginationLinks;
    labels: AdministrationCopy;
};

export function AdministrationPaginationFooter({
    meta,
    links,
    labels,
}: PaginationFooterProps) {
    return (
        <div className="flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
                {meta.total === 0
                    ? labels.noResultsRange
                    : formatAdministrationCopy(labels.showing, {
                          from: meta.from,
                          to: meta.to,
                          total: meta.total,
                      })}
                <span className="mx-2" aria-hidden>
                    ·
                </span>
                {formatAdministrationCopy(labels.pageOf, {
                    current: meta.currentPage,
                    last: meta.lastPage,
                })}
            </p>
            <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                    <PaginationItem>
                        {links.previous ? (
                            <PaginationPrevious
                                label={labels.previous}
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
                                label={labels.previous}
                                disabled
                            />
                        )}
                    </PaginationItem>
                    <PaginationItem>
                        {links.next ? (
                            <PaginationNext
                                label={labels.next}
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
                            <PaginationNext label={labels.next} disabled />
                        )}
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
