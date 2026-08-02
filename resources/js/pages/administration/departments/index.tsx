import { Head, router, useForm } from '@inertiajs/react';
import { Filter, Pencil, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar, FilterField } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
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
    AdministrationPaginationFooter,
    AdministrationSubnav,
    administrationRoutes,
    getAdministrationCopy,
} from '@/features/administration';
import { formatDateTime } from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import type {
    AdministrationDepartmentCreatePayload,
    AdministrationDepartmentRow,
    AdministrationDepartmentUpdatePayload,
    AdministrationDepartmentsIndexProps,
} from '@/types/administration';

const NONE_MANAGER = '__none__';

export default function AdministrationDepartmentsIndex({
    departments,
    filters,
}: AdministrationDepartmentsIndexProps) {
    const { locale } = useDirection();
    const t = getAdministrationCopy(locale);
    const [search, setSearch] = useState(filters.search ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] =
        useState<AdministrationDepartmentRow | null>(null);

    const createForm = useForm<AdministrationDepartmentCreatePayload>({
        name: '',
        code: '',
    });

    const editForm = useForm<AdministrationDepartmentUpdatePayload>({
        name: '',
        code: '',
        manager_id: null,
    });

    const applyFilters = (nextSearch = search): void => {
        router.get(
            administrationRoutes.departments.indexUrl({
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
            administrationRoutes.departments.indexUrl(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const openEdit = (row: AdministrationDepartmentRow): void => {
        setEditTarget(row);
        editForm.setData({
            name: row.name,
            code: row.code,
            manager_id: row.manager?.id ?? null,
        });
        editForm.clearErrors();
    };

    const onCreate = (): void => {
        createForm.post(administrationRoutes.departments.storeUrl(), {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
                createForm.clearErrors();
            },
        });
    };

    const onUpdate = (): void => {
        if (!editTarget) {
            return;
        }

        editForm.put(
            administrationRoutes.departments.updateUrl(editTarget.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditTarget(null);
                    editForm.clearErrors();
                },
            },
        );
    };

    const rows = departments.data;

    return (
        <>
            <Head title={t.departmentsTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.departmentsTitle}
                    description={t.departmentsDescription}
                    actions={
                        <Dialog
                            open={createOpen}
                            onOpenChange={(open) => {
                                if (createForm.processing) {
                                    return;
                                }

                                setCreateOpen(open);

                                if (!open) {
                                    createForm.clearErrors();
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button type="button" size="sm">
                                    <Plus className="size-4" />
                                    {t.createDepartment}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t.createDepartmentTitle}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t.createDepartmentDescription}
                                    </DialogDescription>
                                </DialogHeader>

                                {createForm.hasErrors ? (
                                    <Alert variant="destructive">
                                        <AlertTitle>
                                            {t.validationSummary}
                                        </AlertTitle>
                                        <AlertDescription>
                                            {t.validationSummary}
                                        </AlertDescription>
                                    </Alert>
                                ) : null}

                                <div className="grid gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-name">
                                            {t.name}
                                        </Label>
                                        <Input
                                            id="create-name"
                                            value={createForm.data.name}
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={createForm.processing}
                                            aria-invalid={Boolean(
                                                createForm.errors.name,
                                            )}
                                        />
                                        <InputError
                                            message={createForm.errors.name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-code">
                                            {t.code}
                                        </Label>
                                        <Input
                                            id="create-code"
                                            value={createForm.data.code}
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={createForm.processing}
                                            aria-invalid={Boolean(
                                                createForm.errors.code,
                                            )}
                                            className="font-mono uppercase"
                                        />
                                        <InputError
                                            message={createForm.errors.code}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={createForm.processing}
                                        >
                                            {t.cancel}
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        onClick={onCreate}
                                        disabled={createForm.processing}
                                    >
                                        {createForm.processing ? (
                                            <Spinner />
                                        ) : null}
                                        {createForm.processing
                                            ? t.processing
                                            : t.create}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    }
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
                    <FilterField label={t.search} htmlFor="dept-search">
                        <Input
                            id="dept-search"
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
                                title={t.emptyDepartmentsTitle}
                                description={t.emptyDepartmentsDescription}
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t.name}</TableHead>
                                        <TableHead>{t.code}</TableHead>
                                        <TableHead>{t.manager}</TableHead>
                                        <TableHead className="text-end">
                                            {t.usersCount}
                                        </TableHead>
                                        <TableHead className="text-end">
                                            {t.purchaseRequestsCount}
                                        </TableHead>
                                        <TableHead>{t.updatedAt}</TableHead>
                                        <TableHead className="text-end">
                                            {t.edit}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">
                                                {row.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.code}
                                            </TableCell>
                                            <TableCell>
                                                {row.manager ? (
                                                    <div>
                                                        <p>
                                                            {row.manager.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {row.manager.email}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        {t.noManager}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-end tabular-nums">
                                                {row.usersCount}
                                            </TableCell>
                                            <TableCell className="text-end tabular-nums">
                                                {row.purchaseRequestsCount}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDateTime(
                                                    row.updatedAt,
                                                    locale,
                                                ) ?? t.notAvailable}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openEdit(row)
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                    {t.edit}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <AdministrationPaginationFooter
                                meta={departments.meta}
                                links={departments.links}
                                labels={t}
                            />
                        </>
                    )}
                </div>

                <Dialog
                    open={editTarget !== null}
                    onOpenChange={(open) => {
                        if (editForm.processing) {
                            return;
                        }

                        if (!open) {
                            setEditTarget(null);
                            editForm.clearErrors();
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t.editDepartmentTitle}</DialogTitle>
                            <DialogDescription>
                                {t.editDepartmentDescription}
                            </DialogDescription>
                        </DialogHeader>

                        {editForm.hasErrors ? (
                            <Alert variant="destructive">
                                <AlertTitle>{t.validationSummary}</AlertTitle>
                                <AlertDescription>
                                    {t.validationSummary}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">{t.name}</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    disabled={editForm.processing}
                                    aria-invalid={Boolean(editForm.errors.name)}
                                />
                                <InputError message={editForm.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-code">{t.code}</Label>
                                <Input
                                    id="edit-code"
                                    value={editForm.data.code}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'code',
                                            event.target.value,
                                        )
                                    }
                                    disabled={editForm.processing}
                                    aria-invalid={Boolean(editForm.errors.code)}
                                    className="font-mono uppercase"
                                />
                                <InputError message={editForm.errors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-manager">
                                    {t.manager}
                                </Label>
                                <Select
                                    value={
                                        editForm.data.manager_id == null
                                            ? NONE_MANAGER
                                            : String(editForm.data.manager_id)
                                    }
                                    onValueChange={(value) =>
                                        editForm.setData(
                                            'manager_id',
                                            value === NONE_MANAGER
                                                ? null
                                                : Number(value),
                                        )
                                    }
                                    disabled={editForm.processing}
                                >
                                    <SelectTrigger
                                        id="edit-manager"
                                        className="w-full"
                                        aria-invalid={Boolean(
                                            editForm.errors.manager_id,
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={t.noManager}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE_MANAGER}>
                                            {t.noManager}
                                        </SelectItem>
                                        {(
                                            editTarget?.managerCandidates ?? []
                                        ).map((candidate) => (
                                            <SelectItem
                                                key={candidate.id}
                                                value={String(candidate.id)}
                                            >
                                                {candidate.name} ·{' '}
                                                {candidate.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {t.managerCandidatesHint}
                                </p>
                                <InputError
                                    message={editForm.errors.manager_id}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={editForm.processing}
                                >
                                    {t.cancel}
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={onUpdate}
                                disabled={editForm.processing}
                            >
                                {editForm.processing ? <Spinner /> : null}
                                {editForm.processing ? t.processing : t.save}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

AdministrationDepartmentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Administration',
            href: administrationRoutes.departments.index(),
        },
        {
            title: 'Departments',
            href: administrationRoutes.departments.index(),
        },
    ],
};
