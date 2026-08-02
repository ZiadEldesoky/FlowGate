/**
 * Thin frontend accessors over generated Wayfinder helpers for administration.
 * Generated artifacts live in resources/js/routes (gitignored).
 * Run: php artisan wayfinder:generate --with-form
 */
import type { InertiaLinkProps } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';
import { index as administrationIndexRoute } from '@/routes/administration';
import { index as activityIndexRoute } from '@/routes/administration/activity';
import {
    index as departmentsIndexRoute,
    store as departmentsStoreRoute,
    update as departmentsUpdateRoute,
} from '@/routes/administration/departments';
import {
    index as usersIndexRoute,
    update as usersUpdateRoute,
} from '@/routes/administration/users';

export type AdministrationDepartmentsQuery = {
    search?: string;
    page?: number | string | null;
};

export type AdministrationUsersQuery = {
    search?: string;
    role?: string | null;
    departmentId?: number | string | null;
    page?: number | string | null;
};

export type AdministrationActivityQuery = {
    search?: string;
    action?: string | null;
    page?: number | string | null;
};

function compactQuery(
    params: Record<string, string | number | null | undefined>,
): Record<string, string | number> {
    const result: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        const normalized = String(value).trim();

        if (normalized.length === 0 || normalized === 'all') {
            return;
        }

        result[key] = typeof value === 'number' ? value : normalized;
    });

    return result;
}

function asHref(
    definition: NonNullable<InertiaLinkProps['href']>,
): NonNullable<InertiaLinkProps['href']> {
    return definition;
}

function withQuery(
    query: Record<string, string | number>,
): { query: Record<string, string | number> } | undefined {
    return Object.keys(query).length > 0 ? { query } : undefined;
}

export const administrationRoutes = {
    root: () => asHref(administrationIndexRoute()),
    rootUrl: (): string => toUrl(administrationIndexRoute()),
    departments: {
        index: (query: AdministrationDepartmentsQuery = {}) =>
            asHref(
                departmentsIndexRoute(
                    withQuery(
                        compactQuery({
                            search: query.search,
                            page: query.page,
                        }),
                    ),
                ),
            ),
        indexUrl: (query: AdministrationDepartmentsQuery = {}): string =>
            toUrl(administrationRoutes.departments.index(query)),
        store: () => asHref(departmentsStoreRoute()),
        storeUrl: (): string => toUrl(departmentsStoreRoute()),
        update: (departmentId: number | string) =>
            asHref(departmentsUpdateRoute(departmentId)),
        updateUrl: (departmentId: number | string): string =>
            toUrl(departmentsUpdateRoute(departmentId)),
    },
    users: {
        index: (query: AdministrationUsersQuery = {}) =>
            asHref(
                usersIndexRoute(
                    withQuery(
                        compactQuery({
                            search: query.search,
                            role: query.role,
                            department_id: query.departmentId,
                            page: query.page,
                        }),
                    ),
                ),
            ),
        indexUrl: (query: AdministrationUsersQuery = {}): string =>
            toUrl(administrationRoutes.users.index(query)),
        update: (userId: number | string) => asHref(usersUpdateRoute(userId)),
        updateUrl: (userId: number | string): string =>
            toUrl(usersUpdateRoute(userId)),
    },
    activity: {
        index: (query: AdministrationActivityQuery = {}) =>
            asHref(
                activityIndexRoute(
                    withQuery(
                        compactQuery({
                            search: query.search,
                            action: query.action,
                            page: query.page,
                        }),
                    ),
                ),
            ),
        indexUrl: (query: AdministrationActivityQuery = {}): string =>
            toUrl(administrationRoutes.activity.index(query)),
    },
} as const;
