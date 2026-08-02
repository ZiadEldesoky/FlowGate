/**
 * Temporary URL builders for administration routes until Wayfinder generation
 * is available after backend integration.
 * Keep all path construction here — do not scatter route strings.
 */
import type { InertiaLinkProps } from '@inertiajs/react';

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

function buildQuery(
    params: Record<string, string | number | null | undefined> = {},
): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        const normalized = String(value).trim();

        if (normalized.length === 0 || normalized === 'all') {
            return;
        }

        search.set(key, normalized);
    });

    const query = search.toString();

    return query ? `?${query}` : '';
}

function asHref(url: string): NonNullable<InertiaLinkProps['href']> {
    return url;
}

export const administrationRoutes = {
    root: () => asHref('/administration'),
    rootUrl: (): string => '/administration',
    departments: {
        index: (query: AdministrationDepartmentsQuery = {}) =>
            asHref(
                `/administration/departments${buildQuery({
                    search: query.search,
                    page: query.page,
                })}`,
            ),
        indexUrl: (query: AdministrationDepartmentsQuery = {}): string =>
            `/administration/departments${buildQuery({
                search: query.search,
                page: query.page,
            })}`,
        storeUrl: (): string => '/administration/departments',
        updateUrl: (departmentId: number | string): string =>
            `/administration/departments/${departmentId}`,
    },
    users: {
        index: (query: AdministrationUsersQuery = {}) =>
            asHref(
                `/administration/users${buildQuery({
                    search: query.search,
                    role: query.role,
                    department_id: query.departmentId,
                    page: query.page,
                })}`,
            ),
        indexUrl: (query: AdministrationUsersQuery = {}): string =>
            `/administration/users${buildQuery({
                search: query.search,
                role: query.role,
                department_id: query.departmentId,
                page: query.page,
            })}`,
        updateUrl: (userId: number | string): string =>
            `/administration/users/${userId}`,
    },
    activity: {
        index: (query: AdministrationActivityQuery = {}) =>
            asHref(
                `/administration/activity${buildQuery({
                    search: query.search,
                    action: query.action,
                    page: query.page,
                })}`,
            ),
        indexUrl: (query: AdministrationActivityQuery = {}): string =>
            `/administration/activity${buildQuery({
                search: query.search,
                action: query.action,
                page: query.page,
            })}`,
    },
} as const;
