import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    NotificationsTable,
    formatNotificationCopy,
    getNotificationCopy,
    notificationRoutes,
} from '@/features/notifications';
import { useDirection } from '@/hooks/use-direction';
import type { NotificationsIndexProps } from '@/types/notifications';

export default function NotificationsIndex({
    notifications,
    unreadCount,
}: NotificationsIndexProps) {
    const { locale } = useDirection();
    const t = getNotificationCopy(locale);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [markingAll, setMarkingAll] = useState(false);
    const rows = notifications.data;
    const meta = notifications.meta;
    const links = notifications.links;

    const markRead = (notificationId: string): void => {
        setProcessingId(notificationId);
        router.patch(
            notificationRoutes.readUrl(notificationId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const markAllRead = (): void => {
        setMarkingAll(true);
        router.patch(
            notificationRoutes.readAllUrl(),
            {},
            {
                preserveScroll: true,
                onFinish: () => setMarkingAll(false),
            },
        );
    };

    return (
        <>
            <Head title={t.indexTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.indexTitle}
                    description={t.indexDescription}
                    meta={
                        <p className="text-xs text-muted-foreground">
                            {formatNotificationCopy(t.unreadSummary, {
                                count: unreadCount,
                            })}
                        </p>
                    }
                    actions={
                        unreadCount > 0 ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={markAllRead}
                                disabled={markingAll}
                            >
                                <CheckCheck className="size-4" />
                                {markingAll ? t.processing : t.markAllRead}
                            </Button>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-md border bg-card">
                    {rows.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                icon={Bell}
                                title={t.emptyTitle}
                                description={t.emptyDescription}
                            />
                        </div>
                    ) : (
                        <>
                            <NotificationsTable
                                rows={rows}
                                locale={locale}
                                labels={t}
                                processingId={processingId}
                                onMarkRead={markRead}
                            />
                            <div className="flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">
                                    {meta.total === 0
                                        ? t.noResultsRange
                                        : formatNotificationCopy(t.showing, {
                                              from: meta.from,
                                              to: meta.to,
                                              total: meta.total,
                                          })}
                                    <span className="mx-2" aria-hidden>
                                        ·
                                    </span>
                                    {formatNotificationCopy(t.pageOf, {
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

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notifications',
            href: notificationRoutes.index(),
        },
    ],
};
