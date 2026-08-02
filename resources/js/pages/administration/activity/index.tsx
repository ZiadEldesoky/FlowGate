import { Head, router } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar, FilterField } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AdministrationPaginationFooter,
    AdministrationSubnav,
    administrationRoutes,
    getActivityActionLabel,
    getActivityFieldLabel,
    getActivitySubjectTypeLabel,
    getAdministrationCopy,
    getOrganizationRoleLabel,
} from '@/features/administration';
import { formatDateTime } from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import type {
    AdministrationActivityChange,
    AdministrationActivityIndexProps,
} from '@/types/administration';
import type { AppLocale } from '@/types/locale';

const ALL = 'all';

function formatChangeValue(
    field: string,
    value: string | null,
    locale: AppLocale,
    emptyLabel: string,
): string {
    if (value == null || value === '') {
        return emptyLabel;
    }

    if (field === 'role') {
        return getOrganizationRoleLabel(value, locale);
    }

    return value;
}

function ChangesList({
    changes,
    locale,
    emptyLabel,
    fromLabel,
    toLabel,
}: {
    changes: AdministrationActivityChange[];
    locale: AppLocale;
    emptyLabel: string;
    fromLabel: string;
    toLabel: string;
}) {
    if (changes.length === 0) {
        return <span className="text-muted-foreground">{emptyLabel}</span>;
    }

    return (
        <ul className="space-y-1 text-sm">
            {changes.map((change, index) => (
                <li key={`${change.field}-${index}`} className="leading-5">
                    <span className="font-medium">
                        {getActivityFieldLabel(change.field, locale)}:
                    </span>{' '}
                    <span className="text-muted-foreground">
                        {fromLabel}{' '}
                        {formatChangeValue(
                            change.field,
                            change.from,
                            locale,
                            emptyLabel,
                        )}
                    </span>
                    <span className="mx-1" aria-hidden>
                        ·
                    </span>
                    <span>
                        {toLabel}{' '}
                        {formatChangeValue(
                            change.field,
                            change.to,
                            locale,
                            emptyLabel,
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default function AdministrationActivityIndex({
    activities,
    filters,
    actionOptions,
}: AdministrationActivityIndexProps) {
    const { locale } = useDirection();
    const t = getAdministrationCopy(locale);
    const [search, setSearch] = useState(filters.search ?? '');
    const selectedAction = filters.action || ALL;

    const applyFilters = (next?: {
        search?: string;
        action?: string;
    }): void => {
        const nextSearch = next?.search ?? search;
        const nextAction = next?.action ?? selectedAction;

        router.get(
            administrationRoutes.activity.indexUrl({
                search: nextSearch,
                action: nextAction === ALL ? null : nextAction,
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
            administrationRoutes.activity.indexUrl(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const rows = activities.data;

    return (
        <>
            <Head title={t.activityTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.activityTitle}
                    description={t.activityDescription}
                />

                <AdministrationSubnav />

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
                    <FilterField label={t.search} htmlFor="activity-search">
                        <Input
                            id="activity-search"
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
                    <FilterField label={t.action} htmlFor="activity-action">
                        <Select
                            value={selectedAction}
                            onValueChange={(value) =>
                                applyFilters({ action: value })
                            }
                        >
                            <SelectTrigger
                                id="activity-action"
                                className="w-full min-w-[12rem]"
                            >
                                <SelectValue placeholder={t.allActions} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>
                                    {t.allActions}
                                </SelectItem>
                                {actionOptions.map((action) => (
                                    <SelectItem key={action} value={action}>
                                        {getActivityActionLabel(action, locale)}
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
                                title={t.emptyActivityTitle}
                                description={t.emptyActivityDescription}
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t.createdAt}</TableHead>
                                        <TableHead>{t.action}</TableHead>
                                        <TableHead>{t.actor}</TableHead>
                                        <TableHead>{t.subject}</TableHead>
                                        <TableHead>{t.changes}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="whitespace-nowrap text-muted-foreground">
                                                {formatDateTime(
                                                    row.createdAt,
                                                    locale,
                                                ) ?? t.notAvailable}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {getActivityActionLabel(
                                                    row.action,
                                                    locale,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {row.actor.name}
                                            </TableCell>
                                            <TableCell className="max-w-[14rem] whitespace-normal">
                                                <p>{row.subjectLabel}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {getActivitySubjectTypeLabel(
                                                        row.subjectType,
                                                        locale,
                                                    )}{' '}
                                                    #{row.subjectId}
                                                </p>
                                            </TableCell>
                                            <TableCell className="max-w-[22rem] whitespace-normal">
                                                <ChangesList
                                                    changes={row.changes}
                                                    locale={locale}
                                                    emptyLabel={t.notAvailable}
                                                    fromLabel={t.changeFrom}
                                                    toLabel={t.changeTo}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <AdministrationPaginationFooter
                                meta={activities.meta}
                                links={activities.links}
                                labels={t}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

AdministrationActivityIndex.layout = {
    breadcrumbs: [
        {
            title: 'Administration',
            href: administrationRoutes.departments.index(),
        },
        {
            title: 'Activity',
            href: administrationRoutes.activity.index(),
        },
    ],
};
