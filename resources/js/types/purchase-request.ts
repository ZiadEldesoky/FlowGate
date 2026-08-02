export type PurchaseRequestStatus =
    | 'draft'
    | 'pending_manager_review'
    | 'pending_procurement_review'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'cancelled';

export type PurchaseRequestCurrency = 'EGP';

export type PurchaseRequestUserSummary = {
    id: number;
    name: string;
    email?: string;
};

export type PurchaseRequestDepartment = {
    id: number;
    name: string;
    code: string;
};

export type PurchaseRequestListItem = {
    id: number;
    reference: string;
    title: string;
    requester: {
        id: number;
        name: string;
    };
    department: PurchaseRequestDepartment;
    status: PurchaseRequestStatus;
    currency: string;
    totalAmount: string;
    neededBy: string | null;
    submittedAt: string | null;
    createdAt: string;
};

export type PurchaseRequestPaginationMeta = {
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    total: number;
};

export type PurchaseRequestPaginationLinks = {
    previous: string | null;
    next: string | null;
};

export type PurchaseRequestIndexProps = {
    purchaseRequests: {
        data: PurchaseRequestListItem[];
        meta: PurchaseRequestPaginationMeta;
        links: PurchaseRequestPaginationLinks;
    };
    filters: {
        search: string;
        status: string | null;
    };
    statuses: string[];
    can: {
        create: boolean;
    };
};

export type PurchaseRequestFormItem = {
    description: string;
    sku: string | null;
    quantity: string;
    unit_price: string;
};

export type PurchaseRequestFormPayload = {
    title: string;
    justification: string;
    needed_by: string | null;
    currency: PurchaseRequestCurrency;
    items: PurchaseRequestFormItem[];
};

export type PurchaseRequestFormErrorKey =
    | keyof PurchaseRequestFormPayload
    | `items.${number}.${keyof PurchaseRequestFormItem}`;

export type PurchaseRequestCreateProps = {
    department: PurchaseRequestDepartment;
    defaults: {
        currency: PurchaseRequestCurrency;
    };
};

export type PurchaseRequestEditItem = {
    id: number;
    description: string;
    sku: string | null;
    quantity: string;
    unitPrice: string;
};

export type PurchaseRequestEditProps = {
    purchaseRequest: {
        id: number;
        reference: string;
        title: string;
        justification: string;
        neededBy: string | null;
        currency: string;
        items: PurchaseRequestEditItem[];
    };
};

export type PurchaseRequestDetailItem = {
    id: number;
    description: string;
    sku: string | null;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    position: number;
};

export type PurchaseRequestApproval = {
    id: number;
    stage: string;
    decision: string;
    comment: string | null;
    decidedAt: string;
    actor: {
        id: number;
        name: string;
    };
};

export type PurchaseRequestActivity = {
    id: number;
    action: string;
    fromStatus: string | null;
    toStatus: string;
    comment: string | null;
    createdAt: string;
    actor: {
        id: number;
        name: string;
    } | null;
};

export type PurchaseRequestDetail = {
    id: number;
    reference: string;
    title: string;
    justification: string;
    neededBy: string | null;
    status: PurchaseRequestStatus;
    currency: string;
    totalAmount: string;
    submittedAt: string | null;
    createdAt: string;
    requester: {
        id: number;
        name: string;
        email: string;
    };
    department: PurchaseRequestDepartment;
    items: PurchaseRequestDetailItem[];
    approvals: PurchaseRequestApproval[];
    activity: PurchaseRequestActivity[];
};

export type PurchaseRequestShowProps = {
    purchaseRequest: PurchaseRequestDetail;
    allowedActions: string[];
    can: {
        update: boolean;
    };
};
