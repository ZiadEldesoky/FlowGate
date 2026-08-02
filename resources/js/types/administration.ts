export type OrganizationRole =
    'requester' | 'manager' | 'procurement' | 'administrator';

export type AdministrationSubjectType = 'department' | 'user';

export type AdministrationActivityAction =
    'department_created' | 'department_updated' | 'user_assignment_updated';

export type AdministrationPaginationMeta = {
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    total: number;
};

export type AdministrationPaginationLinks = {
    previous: string | null;
    next: string | null;
};

export type AdministrationUserSummary = {
    id: number;
    name: string;
    email: string;
};

export type AdministrationDepartmentSummary = {
    id: number;
    name: string;
    code: string;
};

export type AdministrationDepartmentRow = {
    id: number;
    name: string;
    code: string;
    manager: AdministrationUserSummary | null;
    usersCount: number;
    purchaseRequestsCount: number;
    managerCandidates: AdministrationUserSummary[];
    updatedAt: string;
};

export type AdministrationDepartmentsIndexProps = {
    departments: {
        data: AdministrationDepartmentRow[];
        meta: AdministrationPaginationMeta;
        links: AdministrationPaginationLinks;
    };
    filters: {
        search: string;
    };
};

export type AdministrationDepartmentCreatePayload = {
    name: string;
    code: string;
};

export type AdministrationDepartmentUpdatePayload = {
    name: string;
    code: string;
    manager_id: number | null;
};

export type AdministrationUserRow = {
    id: number;
    name: string;
    email: string;
    role: OrganizationRole;
    department: AdministrationDepartmentSummary | null;
    managedDepartments: AdministrationDepartmentSummary[];
    updatedAt: string;
};

export type AdministrationUsersIndexProps = {
    users: {
        data: AdministrationUserRow[];
        meta: AdministrationPaginationMeta;
        links: AdministrationPaginationLinks;
    };
    filters: {
        search: string;
        role: string;
        departmentId: number | null;
    };
    departmentOptions: AdministrationDepartmentSummary[];
    roleOptions: OrganizationRole[];
};

export type AdministrationUserUpdatePayload = {
    role: string;
    department_id: number | null;
};

export type AdministrationActivityChange = {
    field: string;
    from: string | null;
    to: string | null;
};

export type AdministrationActivityRow = {
    id: number;
    action: AdministrationActivityAction;
    actor: {
        id: number;
        name: string;
    };
    subjectType: AdministrationSubjectType;
    subjectId: number;
    subjectLabel: string;
    changes: AdministrationActivityChange[];
    createdAt: string;
};

export type AdministrationActivityIndexProps = {
    activities: {
        data: AdministrationActivityRow[];
        meta: AdministrationPaginationMeta;
        links: AdministrationPaginationLinks;
    };
    filters: {
        search: string;
        action: string;
    };
    actionOptions: AdministrationActivityAction[];
};
