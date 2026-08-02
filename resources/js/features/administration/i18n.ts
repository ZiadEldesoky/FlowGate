import type {
    AdministrationActivityAction,
    OrganizationRole,
} from '@/types/administration';
import type { AppLocale } from '@/types/locale';

export const administrationCopy = {
    ar: {
        navTitle: 'الإدارة',
        subnavLabel: 'أقسام الإدارة',
        departmentsNav: 'الأقسام',
        usersNav: 'المستخدمون',
        activityNav: 'سجل النشاط',
        departmentsTitle: 'الأقسام',
        departmentsDescription:
            'إدارة الأقسام وتعيين المديرين المؤهلين من نفس القسم.',
        usersTitle: 'المستخدمون',
        usersDescription: 'تعيين الأدوار والأقسام. القواعد تُطبَّق على الخادم.',
        activityTitle: 'سجل النشاط الإداري',
        activityDescription: 'تتبع تغييرات الأقسام وتعيينات المستخدمين.',
        search: 'بحث',
        searchPlaceholder: 'ابحث…',
        clearFilters: 'مسح عوامل التصفية',
        previous: 'السابق',
        next: 'التالي',
        pageOf: 'صفحة {current} من {last}',
        showing: 'عرض {from}–{to} من {total}',
        noResultsRange: 'لا توجد نتائج',
        notAvailable: '—',
        create: 'إنشاء',
        edit: 'تعديل',
        save: 'حفظ',
        cancel: 'إلغاء',
        processing: 'جارٍ المعالجة…',
        validationSummary: 'يرجى مراجعة الحقول المحددة.',
        name: 'الاسم',
        code: 'الرمز',
        manager: 'المدير',
        noManager: 'بدون مدير',
        usersCount: 'المستخدمون',
        purchaseRequestsCount: 'طلبات الشراء',
        updatedAt: 'آخر تحديث',
        createDepartment: 'قسم جديد',
        createDepartmentTitle: 'إنشاء قسم',
        createDepartmentDescription: 'أدخل اسم القسم ورمزه.',
        editDepartmentTitle: 'تعديل القسم',
        editDepartmentDescription:
            'حدّث بيانات القسم أو عيّن مديرًا من المرشحين المؤهلين فقط.',
        managerCandidatesHint:
            'قائمة المرشحين قادمة من الخادم (مستخدمو دور المدير في نفس القسم).',
        emptyDepartmentsTitle: 'لا توجد أقسام',
        emptyDepartmentsDescription: 'أنشئ قسمًا للبدء.',
        email: 'البريد',
        role: 'الدور',
        department: 'القسم',
        allRoles: 'كل الأدوار',
        allDepartments: 'كل الأقسام',
        noDepartment: 'بدون قسم',
        managedDepartments: 'أقسام يديرها',
        managedDepartmentsWarning:
            'هذا المستخدم يدير أقسامًا. تغيير الدور/القسم قد يُرفض من الخادم إن بقيت الإدارة.',
        assignUser: 'تعيين',
        assignUserTitle: 'تعيين المستخدم',
        assignUserDescription: 'حدّث الدور والقسم. التحقق يتم على الخادم.',
        emptyUsersTitle: 'لا يوجد مستخدمون',
        emptyUsersDescription: 'لا توجد نتائج مطابقة لعوامل التصفية.',
        action: 'الإجراء',
        allActions: 'كل الإجراءات',
        actor: 'المنفّذ',
        subject: 'العنصر',
        changes: 'التغييرات',
        createdAt: 'التاريخ',
        emptyActivityTitle: 'لا يوجد نشاط',
        emptyActivityDescription: 'لا توجد سجلات مطابقة.',
        changeFrom: 'من',
        changeTo: 'إلى',
        field: 'الحقل',
        roleRequester: 'مقدّم طلب',
        roleManager: 'مدير',
        roleProcurement: 'مشتريات',
        roleAdministrator: 'مسؤول',
        actionDepartmentCreated: 'إنشاء قسم',
        actionDepartmentUpdated: 'تحديث قسم',
        actionUserAssignmentUpdated: 'تحديث تعيين مستخدم',
        fieldName: 'الاسم',
        fieldCode: 'الرمز',
        fieldManagerId: 'المدير',
        fieldRole: 'الدور',
        fieldDepartmentId: 'القسم',
    },
    en: {
        navTitle: 'Administration',
        subnavLabel: 'Administration sections',
        departmentsNav: 'Departments',
        usersNav: 'Users',
        activityNav: 'Activity',
        departmentsTitle: 'Departments',
        departmentsDescription:
            'Manage departments and assign eligible same-department managers.',
        usersTitle: 'Users',
        usersDescription:
            'Assign roles and departments. Server rules remain authoritative.',
        activityTitle: 'Administration activity',
        activityDescription:
            'Track department changes and user assignment updates.',
        search: 'Search',
        searchPlaceholder: 'Search…',
        clearFilters: 'Clear filters',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {current} of {last}',
        showing: 'Showing {from}–{to} of {total}',
        noResultsRange: 'No results',
        notAvailable: '—',
        create: 'Create',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        processing: 'Processing…',
        validationSummary: 'Please review the highlighted fields.',
        name: 'Name',
        code: 'Code',
        manager: 'Manager',
        noManager: 'No manager',
        usersCount: 'Users',
        purchaseRequestsCount: 'Purchase requests',
        updatedAt: 'Updated',
        createDepartment: 'New department',
        createDepartmentTitle: 'Create department',
        createDepartmentDescription: 'Enter the department name and code.',
        editDepartmentTitle: 'Edit department',
        editDepartmentDescription:
            'Update department details or assign a manager from server-provided candidates only.',
        managerCandidatesHint:
            'Candidates come from the server (manager-role users in the same department).',
        emptyDepartmentsTitle: 'No departments',
        emptyDepartmentsDescription: 'Create a department to get started.',
        email: 'Email',
        role: 'Role',
        department: 'Department',
        allRoles: 'All roles',
        allDepartments: 'All departments',
        noDepartment: 'No department',
        managedDepartments: 'Manages',
        managedDepartmentsWarning:
            'This user manages departments. Role/department changes may be rejected by the server while management remains assigned.',
        assignUser: 'Assign',
        assignUserTitle: 'Assign user',
        assignUserDescription:
            'Update role and department. Validation is enforced by the server.',
        emptyUsersTitle: 'No users',
        emptyUsersDescription: 'No results match the current filters.',
        action: 'Action',
        allActions: 'All actions',
        actor: 'Actor',
        subject: 'Subject',
        changes: 'Changes',
        createdAt: 'When',
        emptyActivityTitle: 'No activity',
        emptyActivityDescription: 'No matching activity records.',
        changeFrom: 'From',
        changeTo: 'To',
        field: 'Field',
        roleRequester: 'Requester',
        roleManager: 'Manager',
        roleProcurement: 'Procurement',
        roleAdministrator: 'Administrator',
        actionDepartmentCreated: 'Department created',
        actionDepartmentUpdated: 'Department updated',
        actionUserAssignmentUpdated: 'User assignment updated',
        fieldName: 'Name',
        fieldCode: 'Code',
        fieldManagerId: 'Manager',
        fieldRole: 'Role',
        fieldDepartmentId: 'Department',
    },
} as const;

export type AdministrationCopy = (typeof administrationCopy)[AppLocale];

export function getAdministrationCopy(locale: AppLocale): AdministrationCopy {
    return administrationCopy[locale];
}

export function formatAdministrationCopy(
    template: string,
    values: Record<string, string | number | null | undefined>,
): string {
    return Object.entries(values).reduce((result, [key, value]) => {
        return result.replaceAll(
            `{${key}}`,
            value == null ? '—' : String(value),
        );
    }, template);
}

export function getOrganizationRoleLabel(
    role: OrganizationRole | string,
    locale: AppLocale,
): string {
    const t = getAdministrationCopy(locale);

    switch (role) {
        case 'requester':
            return t.roleRequester;
        case 'manager':
            return t.roleManager;
        case 'procurement':
            return t.roleProcurement;
        case 'administrator':
            return t.roleAdministrator;
        default:
            return role;
    }
}

export function getActivityActionLabel(
    action: AdministrationActivityAction | string,
    locale: AppLocale,
): string {
    const t = getAdministrationCopy(locale);

    switch (action) {
        case 'department_created':
            return t.actionDepartmentCreated;
        case 'department_updated':
            return t.actionDepartmentUpdated;
        case 'user_assignment_updated':
            return t.actionUserAssignmentUpdated;
        default:
            return action;
    }
}

export function getActivityFieldLabel(
    field: string,
    locale: AppLocale,
): string {
    const t = getAdministrationCopy(locale);

    switch (field) {
        case 'name':
            return t.fieldName;
        case 'code':
            return t.fieldCode;
        case 'manager_id':
            return t.fieldManagerId;
        case 'role':
            return t.fieldRole;
        case 'department_id':
            return t.fieldDepartmentId;
        default:
            return field;
    }
}
