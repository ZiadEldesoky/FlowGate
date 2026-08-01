import type { PresentationStatus } from '@/types/status';

/**
 * UI-only preview rows for design-system demonstration.
 * Not domain state. Totals are display strings only — server remains source of truth.
 */
export type PurchaseRequestPreviewRow = {
    id: string;
    reference: string;
    title: {
        en: string;
        ar: string;
    };
    requester: {
        en: string;
        ar: string;
    };
    department: {
        en: string;
        ar: string;
    };
    status: PresentationStatus;
    /** Preview-only formatted amount string; do not compute totals in React. */
    amountPreview: string;
    submittedAt: string;
};

export const purchaseRequestPreviewRows: PurchaseRequestPreviewRow[] = [
    {
        id: 'pr-1001',
        reference: 'PR-2026-1001',
        title: {
            en: 'Warehouse packing materials',
            ar: 'مواد تعبئة المستودع',
        },
        requester: {
            en: 'Sara Hassan',
            ar: 'سارة حسن',
        },
        department: {
            en: 'Operations',
            ar: 'العمليات',
        },
        status: 'pending',
        amountPreview: 'EGP 18,450.00',
        submittedAt: '2026-07-28',
    },
    {
        id: 'pr-1002',
        reference: 'PR-2026-1002',
        title: {
            en: 'Office IT accessories',
            ar: 'ملحقات تقنية للمكتب',
        },
        requester: {
            en: 'Omar Nabil',
            ar: 'عمر نبيل',
        },
        department: {
            en: 'IT',
            ar: 'تقنية المعلومات',
        },
        status: 'approved',
        amountPreview: 'EGP 6,200.00',
        submittedAt: '2026-07-26',
    },
    {
        id: 'pr-1003',
        reference: 'PR-2026-1003',
        title: {
            en: 'Safety equipment restock',
            ar: 'إعادة تخزين معدات السلامة',
        },
        requester: {
            en: 'Mona Farid',
            ar: 'منى فريد',
        },
        department: {
            en: 'Facilities',
            ar: 'المرافق',
        },
        status: 'draft',
        amountPreview: 'EGP 3,980.00',
        submittedAt: '2026-07-30',
    },
    {
        id: 'pr-1004',
        reference: 'PR-2026-1004',
        title: {
            en: 'Vendor sample order',
            ar: 'طلب عينات من المورد',
        },
        requester: {
            en: 'Karim Adel',
            ar: 'كريم عادل',
        },
        department: {
            en: 'Procurement',
            ar: 'المشتريات',
        },
        status: 'rejected',
        amountPreview: 'EGP 1,150.00',
        submittedAt: '2026-07-22',
    },
    {
        id: 'pr-1005',
        reference: 'PR-2026-1005',
        title: {
            en: 'Annual maintenance kit',
            ar: 'طقم صيانة سنوي',
        },
        requester: {
            en: 'Hana Youssef',
            ar: 'هناء يوسف',
        },
        department: {
            en: 'Maintenance',
            ar: 'الصيانة',
        },
        status: 'completed',
        amountPreview: 'EGP 12,075.00',
        submittedAt: '2026-07-15',
    },
    {
        id: 'pr-1006',
        reference: 'PR-2026-1006',
        title: {
            en: 'Temporary staffing support',
            ar: 'دعم توظيف مؤقت',
        },
        requester: {
            en: 'Youssef Samir',
            ar: 'يوسف سمير',
        },
        department: {
            en: 'HR',
            ar: 'الموارد البشرية',
        },
        status: 'cancelled',
        amountPreview: 'EGP 9,500.00',
        submittedAt: '2026-07-10',
    },
];

/** Preview-only aggregate display string. Not calculated in the UI. */
export const purchaseRequestPreviewTotalLabel = 'EGP 51,355.00';
