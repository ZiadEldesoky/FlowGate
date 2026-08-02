import type { AppLocale } from '@/types/locale';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbLabels: Readonly<
    Record<string, Readonly<Record<AppLocale, string>>>
> = {
    Dashboard: {
        ar: 'لوحة المتابعة',
        en: 'Dashboard',
    },
    'Purchase requests': {
        ar: 'طلبات الشراء',
        en: 'Purchase requests',
    },
    Create: {
        ar: 'إنشاء',
        en: 'Create',
    },
    Edit: {
        ar: 'تعديل',
        en: 'Edit',
    },
    'Appearance settings': {
        ar: 'إعدادات المظهر',
        en: 'Appearance settings',
    },
    'Profile settings': {
        ar: 'إعدادات الملف الشخصي',
        en: 'Profile settings',
    },
    'Security settings': {
        ar: 'إعدادات الأمان',
        en: 'Security settings',
    },
    Notifications: {
        ar: 'الإشعارات',
        en: 'Notifications',
    },
};

export function localizeBreadcrumbs(
    breadcrumbs: BreadcrumbItem[],
    locale: AppLocale,
): BreadcrumbItem[] {
    return breadcrumbs.map((breadcrumb) => ({
        ...breadcrumb,
        title: breadcrumbLabels[breadcrumb.title]?.[locale] ?? breadcrumb.title,
    }));
}
