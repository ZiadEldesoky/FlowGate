import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, FileBarChart2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import {
    formatMoney,
    getPurchaseRequestCopy,
    PurchaseRequestTable,
    purchaseRequestRoutes,
} from '@/features/purchase-requests';
import {
    getReportingScopeLabel,
    getReportsCopy,
    KpiStrip,
    reportRoutes,
    StatusBreakdownList,
} from '@/features/reports';
import { useDirection } from '@/hooks/use-direction';
import { dashboard } from '@/routes';
import type { DashboardPageProps } from '@/types/reports';

export default function Dashboard({
    scope,
    summary,
    statusBreakdown,
    attentionRequests,
    recentRequests,
}: DashboardPageProps) {
    const { locale } = useDirection();
    const t = getReportsCopy(locale);
    const purchaseCopy = getPurchaseRequestCopy(locale);
    const { auth } = usePage().props;
    const canViewReports = auth.can.viewProcurementReports;

    return (
        <>
            <Head title={t.dashboardTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.dashboardTitle}
                    description={t.dashboardDescription}
                    meta={
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {t.scopeLabel}:
                            </span>{' '}
                            {getReportingScopeLabel(scope, locale)}
                        </p>
                    }
                    actions={
                        <>
                            <Button asChild size="sm" variant="outline">
                                <Link href={purchaseRequestRoutes.index()}>
                                    <ShoppingCart className="size-4" />
                                    {purchaseCopy.indexTitle}
                                </Link>
                            </Button>
                            {canViewReports ? (
                                <Button asChild size="sm">
                                    <Link
                                        href={reportRoutes.procurement.index()}
                                    >
                                        <FileBarChart2 className="size-4" />
                                        {t.reportsNav}
                                    </Link>
                                </Button>
                            ) : null}
                        </>
                    }
                />

                <KpiStrip
                    items={[
                        {
                            key: 'total',
                            label: t.totalRequests,
                            value: summary.totalRequests,
                        },
                        {
                            key: 'open',
                            label: t.openRequests,
                            value: summary.openRequests,
                        },
                        {
                            key: 'action',
                            label: t.actionRequired,
                            value: summary.actionRequiredCount,
                        },
                        {
                            key: 'completed',
                            label: t.completedRequests,
                            value: summary.completedRequests,
                        },
                        {
                            key: 'amount',
                            label: t.committedAmount,
                            value: formatMoney(
                                summary.committedAmount,
                                summary.currency,
                                locale,
                            ),
                        },
                    ]}
                />

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <section className="overflow-hidden rounded-md border bg-card">
                        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                            <h2 className="text-sm font-medium">
                                {t.attentionQueue}
                            </h2>
                            <Button asChild size="sm" variant="ghost">
                                <Link href={purchaseRequestRoutes.index()}>
                                    {t.viewAll}
                                    <ArrowRight className="size-4 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </div>
                        {attentionRequests.length === 0 ? (
                            <div className="p-4">
                                <EmptyState title={t.emptyAttention} />
                            </div>
                        ) : (
                            <PurchaseRequestTable
                                rows={attentionRequests}
                                locale={locale}
                                labels={purchaseCopy}
                            />
                        )}
                    </section>

                    <section className="rounded-md border bg-card p-4">
                        <h2 className="mb-3 text-sm font-medium">
                            {t.statusBreakdown}
                        </h2>
                        <StatusBreakdownList
                            items={statusBreakdown}
                            locale={locale}
                            emptyLabel={t.emptyStatus}
                            countLabel={t.count}
                        />
                    </section>
                </div>

                <section className="overflow-hidden rounded-md border bg-card">
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <h2 className="text-sm font-medium">
                            {t.recentRequests}
                        </h2>
                        <Button asChild size="sm" variant="ghost">
                            <Link href={purchaseRequestRoutes.index()}>
                                {t.viewAll}
                                <ArrowRight className="size-4 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                    {recentRequests.length === 0 ? (
                        <div className="p-4">
                            <EmptyState title={t.emptyRecent} />
                        </div>
                    ) : (
                        <PurchaseRequestTable
                            rows={recentRequests}
                            locale={locale}
                            labels={purchaseCopy}
                        />
                    )}
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
