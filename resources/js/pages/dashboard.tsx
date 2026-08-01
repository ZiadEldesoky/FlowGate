import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    FileSearch,
    Filter,
    Inbox,
    Plus,
    RefreshCw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import {
    PurchaseRequestPreviewTable,
    purchaseRequestPreviewRows,
    purchaseRequestPreviewTotalLabel,
} from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import {
    PRESENTATION_STATUSES,
    getPresentationStatusLabel,
} from '@/lib/status';
import { dashboard } from '@/routes';
import type { PresentationStatus } from '@/types/status';

type PreviewView = 'ready' | 'loading' | 'empty' | 'error';

const copy = {
    ar: {
        title: 'طلبات الشراء',
        description:
            'معاينة واجهة المؤسسة لمسار الموافقات. البيانات المعروضة للتصميم فقط.',
        previewBannerTitle: 'بيانات معاينة فقط',
        previewBannerBody:
            'لا توجد حالة نطاق أعمال في الواجهة. الإجماليات المعروضة سلاسل جاهزة من الخادم/العينة وليست حسابات في React.',
        newRequest: 'طلب جديد',
        refresh: 'تحديث',
        search: 'بحث',
        searchPlaceholder: 'مرجع أو عنوان…',
        status: 'الحالة',
        allStatuses: 'كل الحالات',
        clearFilters: 'مسح عوامل التصفية',
        demoControls: 'حالات العرض',
        showReady: 'جدول',
        showLoading: 'تحميل',
        showEmpty: 'فارغ',
        showError: 'خطأ',
        totalPreview: 'إجمالي المعاينة',
        totalNote: 'عرض فقط — المصدر النهائي للخادم',
        emptyTitle: 'لا توجد طلبات مطابقة',
        emptyDescription: 'عدّل عوامل التصفية أو أنشئ طلب شراء جديد.',
        errorTitle: 'تعذر تحميل المعاينة',
        errorDescription:
            'هذه رسالة واجهة فقط لإظهار حالة الخطأ. لا يوجد استدعاء خلفي هنا.',
        retry: 'إعادة المحاولة',
        reference: 'المرجع',
        requestTitle: 'العنوان',
        requester: 'مقدّم الطلب',
        department: 'القسم',
        amount: 'المبلغ',
        submittedAt: 'تاريخ الإرسال',
        previous: 'السابق',
        next: 'التالي',
        pageOf: 'صفحة 1 من 1',
        statusLegend: 'حالات العرض',
        loadingLabel: 'جاري تحميل المعاينة',
    },
    en: {
        title: 'Purchase requests',
        description:
            'Enterprise shell preview for the approvals workspace. Displayed data is design-only.',
        previewBannerTitle: 'UI preview data only',
        previewBannerBody:
            'No domain state is stored here. Displayed totals are preformatted sample strings, not React calculations.',
        newRequest: 'New request',
        refresh: 'Refresh',
        search: 'Search',
        searchPlaceholder: 'Reference or title…',
        status: 'Status',
        allStatuses: 'All statuses',
        clearFilters: 'Clear filters',
        demoControls: 'Preview states',
        showReady: 'Table',
        showLoading: 'Loading',
        showEmpty: 'Empty',
        showError: 'Error',
        totalPreview: 'Preview total',
        totalNote: 'Display only — final totals remain server-owned',
        emptyTitle: 'No matching requests',
        emptyDescription: 'Adjust filters or create a new purchase request.',
        errorTitle: 'Could not load preview',
        errorDescription:
            'Interface-only error affordance. No backend call is made here.',
        retry: 'Retry',
        reference: 'Reference',
        requestTitle: 'Title',
        requester: 'Requester',
        department: 'Department',
        amount: 'Amount',
        submittedAt: 'Submitted',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page 1 of 1',
        statusLegend: 'Status legend',
        loadingLabel: 'Loading preview',
    },
} as const;

export default function Dashboard() {
    const { locale } = useDirection();
    const t = copy[locale];

    const [view, setView] = useState<PreviewView>('ready');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return purchaseRequestPreviewRows.filter((row) => {
            const matchesStatus =
                statusFilter === 'all' || row.status === statusFilter;
            const haystack = [
                row.reference,
                row.title.en,
                row.title.ar,
                row.requester.en,
                row.requester.ar,
                row.department.en,
                row.department.ar,
            ]
                .join(' ')
                .toLowerCase();
            const matchesQuery = query.length === 0 || haystack.includes(query);

            return matchesStatus && matchesQuery;
        });
    }, [search, statusFilter]);

    const tableRows =
        view === 'empty' ? [] : view === 'ready' ? filteredRows : filteredRows;

    return (
        <>
            <Head title={t.title} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.title}
                    description={t.description}
                    actions={
                        <>
                            <Button type="button" variant="outline" size="sm">
                                <RefreshCw className="size-4" />
                                {t.refresh}
                            </Button>
                            <Button type="button" size="sm">
                                <Plus className="size-4" />
                                {t.newRequest}
                            </Button>
                        </>
                    }
                    meta={
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {t.totalPreview}:
                            </span>
                            <span className="font-mono tabular-nums">
                                {purchaseRequestPreviewTotalLabel}
                            </span>
                            <span aria-hidden>•</span>
                            <span>{t.totalNote}</span>
                        </div>
                    }
                />

                <Alert variant="info">
                    <AlertCircle className="size-4" />
                    <AlertTitle>{t.previewBannerTitle}</AlertTitle>
                    <AlertDescription>{t.previewBannerBody}</AlertDescription>
                </Alert>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        {t.demoControls}
                    </span>
                    {(
                        [
                            ['ready', t.showReady],
                            ['loading', t.showLoading],
                            ['empty', t.showEmpty],
                            ['error', t.showError],
                        ] as const
                    ).map(([key, label]) => (
                        <Button
                            key={key}
                            type="button"
                            size="sm"
                            variant={view === key ? 'secondary' : 'outline'}
                            onClick={() => setView(key)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                <FilterBar
                    actions={
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('all');
                            }}
                        >
                            <Filter className="size-4" />
                            {t.clearFilters}
                        </Button>
                    }
                >
                    <FilterField label={t.search} htmlFor="preview-search">
                        <Input
                            id="preview-search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t.searchPlaceholder}
                            autoComplete="off"
                        />
                    </FilterField>
                    <FilterField label={t.status} htmlFor="preview-status">
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger
                                id="preview-status"
                                className="w-full min-w-[10rem]"
                            >
                                <SelectValue placeholder={t.allStatuses} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t.allStatuses}
                                </SelectItem>
                                {PRESENTATION_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {getPresentationStatusLabel(
                                            status,
                                            locale,
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterField>
                </FilterBar>

                <section className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            {t.statusLegend}
                        </span>
                        {PRESENTATION_STATUSES.map((status) => (
                            <StatusBadge
                                key={status}
                                status={status as PresentationStatus}
                                locale={locale}
                            />
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-md border bg-card">
                        {view === 'loading' ? (
                            <div
                                className="space-y-3 p-4"
                                role="status"
                                aria-live="polite"
                                aria-label={t.loadingLabel}
                            >
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="h-9 w-2/3" />
                            </div>
                        ) : null}

                        {view === 'error' ? (
                            <div className="p-4">
                                <Alert variant="destructive">
                                    <AlertCircle className="size-4" />
                                    <AlertTitle>{t.errorTitle}</AlertTitle>
                                    <AlertDescription>
                                        <div className="space-y-3">
                                            <p>{t.errorDescription}</p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setView('ready')}
                                            >
                                                <RefreshCw className="size-4" />
                                                {t.retry}
                                            </Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : null}

                        {view === 'empty' ||
                        (view === 'ready' && tableRows.length === 0) ? (
                            <div className="p-4">
                                <EmptyState
                                    icon={view === 'empty' ? Inbox : FileSearch}
                                    title={t.emptyTitle}
                                    description={t.emptyDescription}
                                    action={
                                        <Button type="button" size="sm">
                                            <Plus className="size-4" />
                                            {t.newRequest}
                                        </Button>
                                    }
                                />
                            </div>
                        ) : null}

                        {view === 'ready' && tableRows.length > 0 ? (
                            <>
                                <PurchaseRequestPreviewTable
                                    rows={tableRows}
                                    locale={locale}
                                    labels={{
                                        reference: t.reference,
                                        title: t.requestTitle,
                                        requester: t.requester,
                                        department: t.department,
                                        status: t.status,
                                        amount: t.amount,
                                        submittedAt: t.submittedAt,
                                    }}
                                />
                                <div className="flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        {t.pageOf}
                                    </p>
                                    <Pagination className="mx-0 w-auto justify-end">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    label={t.previous}
                                                    disabled
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    label={t.next}
                                                    disabled
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </>
                        ) : null}
                    </div>
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
