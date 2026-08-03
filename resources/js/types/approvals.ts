export type ApprovalQueueStage = 'manager_review' | 'procurement_review';

export type ApprovalQueueStatus =
    'pending_manager_review' | 'pending_procurement_review';

export type ApprovalQueueItem = {
    id: number;
    reference: string;
    title: string;
    requester: {
        id: number;
        name: string;
    };
    department: {
        id: number;
        name: string;
        code: string;
    };
    status: ApprovalQueueStatus;
    currency: string;
    totalAmount: string;
    neededBy: string | null;
    submittedAt: string | null;
    reviewDueAt: string | null;
    isOverdue: boolean;
};

export type ApprovalQueuePaginationMeta = {
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    total: number;
};

export type ApprovalQueuePaginationLinks = {
    previous: string | null;
    next: string | null;
};

export type ApprovalsIndexProps = {
    reviews: {
        data: ApprovalQueueItem[];
        meta: ApprovalQueuePaginationMeta;
        links: ApprovalQueuePaginationLinks;
    };
    filters: {
        search: string;
    };
    stage: ApprovalQueueStage;
};

export type PurchaseRequestDecisionAction =
    'approve_manager_review' | 'approve_procurement_review' | 'reject';

export type PurchaseRequestDecisionPayload = {
    comment: string | null;
};
