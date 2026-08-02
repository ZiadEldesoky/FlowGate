import { Head, router, useForm } from '@inertiajs/react';
import { Filter, Search, UserCog } from 'lucide-react';
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
    getOrganizationRoleLabel,
} from '@/features/administration';
import { formatDateTime } from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import type {
    AdministrationUserRow,
    AdministrationUserUpdatePayload,
    AdministrationUsersIndexProps,
    OrganizationRole,
} from '@/types/administration';

const ALL = 'all';
const NONE_DEPARTMENT = '__none__';

export default function AdministrationUsersIndex({
    users,
    filters,
    departmentOptions,
    roleOptions,
}: AdministrationUsersIndexProps) {
    const { locale } = useDirection();
    const t = getAdministrationCopy(locale);
    const [search, setSearch] = useState(filters.search ?? '');
    const selectedRole = filters.role || ALL;
    const selectedDepartment =
        filters.departmentId == null ? ALL : String(filters.departmentId);
    const [editTarget, setEditTarget] = useState<AdministrationUserRow | null>(
        null,
    );

    const editForm = useForm<AdministrationUserUpdatePayload>({
        role: 'requester',
        department_id: null,
    });

    const applyFilters = (next?: {
        search?: string;
        role?: string;
        departmentId?: string;
    }): void => {
        const nextSearch = next?.search ?? search;
        const nextRole = next?.role ?? selectedRole;
        const nextDepartment = next?.departmentId ?? selectedDepartment;

        router.get(
            administrationRoutes.users.indexUrl({
                search: nextSearch,
                role: nextRole === ALL ? null : nextRole,
                departmentId:
                    nextDepartment === ALL ? null : Number(nextDepartment),
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
            administrationRoutes.users.indexUrl(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const openEdit = (row: AdministrationUserRow): void => {
        setEditTarget(row);
        editForm.setData({
            role: row.role,
            department_id: row.department?.id ?? null,
        });
        editForm.clearErrors();
    };

    const onUpdate = (): void => {
        if (!editTarget) {
            return;
        }

        editForm.put(administrationRoutes.users.updateUrl(editTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditTarget(null);
                editForm.clearErrors();
            },
        });
    };

    const rows = users.data;

    return (
        <>
            <Head title={t.usersTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.usersTitle}
                    description={t.usersDescription}
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
                    <FilterField label={t.search} htmlFor="users-search">
                        <Input
                            id="users-search"
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
                    <FilterField label={t.role} htmlFor="users-role">
                        <Select
                            value={selectedRole}
                            onValueChange={(value) =>
                                applyFilters({ role: value })
                            }
                        >
                            <SelectTrigger
                                id="users-role"
                                className="w-full min-w-[10rem]"
                            >
                                <SelectValue placeholder={t.allRoles} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>
                                    {t.allRoles}
                                </SelectItem>
                                {roleOptions.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {getOrganizationRoleLabel(role, locale)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterField>
                    <FilterField
                        label={t.department}
                        htmlFor="users-department"
                    >
                        <Select
                            value={selectedDepartment}
                            onValueChange={(value) =>
                                applyFilters({ departmentId: value })
                            }
                        >
                            <SelectTrigger
                                id="users-department"
                                className="w-full min-w-[12rem]"
                            >
                                <SelectValue placeholder={t.allDepartments} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>
                                    {t.allDepartments}
                                </SelectItem>
                                {departmentOptions.map((department) => (
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

                <div className="overflow-hidden rounded-md border bg-card">
                    {rows.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title={t.emptyUsersTitle}
                                description={t.emptyUsersDescription}
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t.name}</TableHead>
                                        <TableHead>{t.email}</TableHead>
                                        <TableHead>{t.role}</TableHead>
                                        <TableHead>{t.department}</TableHead>
                                        <TableHead>
                                            {t.managedDepartments}
                                        </TableHead>
                                        <TableHead>{t.updatedAt}</TableHead>
                                        <TableHead className="text-end">
                                            {t.assignUser}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">
                                                {row.name}
                                            </TableCell>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell>
                                                {getOrganizationRoleLabel(
                                                    row.role,
                                                    locale,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {row.department
                                                    ? `${row.department.name} (${row.department.code})`
                                                    : t.noDepartment}
                                            </TableCell>
                                            <TableCell className="max-w-[14rem] text-sm whitespace-normal text-muted-foreground">
                                                {row.managedDepartments
                                                    .length === 0
                                                    ? t.notAvailable
                                                    : row.managedDepartments
                                                          .map(
                                                              (department) =>
                                                                  department.code,
                                                          )
                                                          .join(', ')}
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
                                                    <UserCog className="size-4" />
                                                    {t.assignUser}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <AdministrationPaginationFooter
                                meta={users.meta}
                                links={users.links}
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
                            <DialogTitle>{t.assignUserTitle}</DialogTitle>
                            <DialogDescription>
                                {t.assignUserDescription}
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            className="grid gap-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                onUpdate();
                            }}
                        >
                            {editTarget &&
                            editTarget.managedDepartments.length > 0 ? (
                                <Alert variant="warning">
                                    <AlertTitle>
                                        {t.managedDepartments}
                                    </AlertTitle>
                                    <AlertDescription>
                                        <p>{t.managedDepartmentsWarning}</p>
                                        <p className="mt-1 text-xs">
                                            {editTarget.managedDepartments
                                                .map(
                                                    (department) =>
                                                        `${department.name} (${department.code})`,
                                                )
                                                .join(' · ')}
                                        </p>
                                    </AlertDescription>
                                </Alert>
                            ) : null}

                            {editForm.hasErrors ? (
                                <Alert variant="destructive">
                                    <AlertTitle>{t.validationTitle}</AlertTitle>
                                    <AlertDescription>
                                        {t.validationSummary}
                                    </AlertDescription>
                                </Alert>
                            ) : null}

                            <div className="grid gap-3">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium">
                                        {editTarget?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {editTarget?.email}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-role">{t.role}</Label>
                                    <Select
                                        value={editForm.data.role}
                                        onValueChange={(value) =>
                                            editForm.setData(
                                                'role',
                                                value as OrganizationRole,
                                            )
                                        }
                                        disabled={editForm.processing}
                                    >
                                        <SelectTrigger
                                            id="edit-role"
                                            className="w-full"
                                            aria-invalid={Boolean(
                                                editForm.errors.role,
                                            )}
                                            autoFocus
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleOptions.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                >
                                                    {getOrganizationRoleLabel(
                                                        role,
                                                        locale,
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={editForm.errors.role}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-department">
                                        {t.department}
                                    </Label>
                                    <Select
                                        value={
                                            editForm.data.department_id == null
                                                ? NONE_DEPARTMENT
                                                : String(
                                                      editForm.data
                                                          .department_id,
                                                  )
                                        }
                                        onValueChange={(value) =>
                                            editForm.setData(
                                                'department_id',
                                                value === NONE_DEPARTMENT
                                                    ? null
                                                    : Number(value),
                                            )
                                        }
                                        disabled={editForm.processing}
                                    >
                                        <SelectTrigger
                                            id="edit-department"
                                            className="w-full"
                                            aria-invalid={Boolean(
                                                editForm.errors.department_id,
                                            )}
                                        >
                                            <SelectValue
                                                placeholder={t.noDepartment}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE_DEPARTMENT}>
                                                {t.noDepartment}
                                            </SelectItem>
                                            {departmentOptions.map(
                                                (department) => (
                                                    <SelectItem
                                                        key={department.id}
                                                        value={String(
                                                            department.id,
                                                        )}
                                                    >
                                                        {department.name} (
                                                        {department.code})
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={editForm.errors.department_id}
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
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing ? <Spinner /> : null}
                                    {editForm.processing
                                        ? t.processing
                                        : t.save}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

AdministrationUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Administration',
            href: administrationRoutes.departments.index(),
        },
        {
            title: 'Users',
            href: administrationRoutes.users.index(),
        },
    ],
};
