export type PurchaseRequestNotificationAction =
    | 'submit'
    | 'approve_manager_review'
    | 'approve_procurement_review'
    | 'reject'
    | 'complete'
    | 'cancel';

export type ApprovalReviewStage = 'manager_review' | 'procurement_review';

export type UserNotificationBase = {
    id: string;
    purchaseRequestId: number;
    reference: string;
    title: string;
    readAt: string | null;
    createdAt: string;
};

export type PurchaseRequestTransitionNotification = UserNotificationBase & {
    kind: 'purchase_request_transition';
    actorName: string;
    action: PurchaseRequestNotificationAction;
    fromStatus: string;
    toStatus: string;
};

export type PurchaseRequestReviewOverdueNotification = UserNotificationBase & {
    kind: 'purchase_request_review_overdue';
    stage: ApprovalReviewStage;
    reviewDueAt: string;
};

export type UserNotification =
    | PurchaseRequestTransitionNotification
    | PurchaseRequestReviewOverdueNotification;

export type NotificationPaginationMeta = {
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    total: number;
};

export type NotificationPaginationLinks = {
    previous: string | null;
    next: string | null;
};

export type NotificationsIndexProps = {
    notifications: {
        data: UserNotification[];
        meta: NotificationPaginationMeta;
        links: NotificationPaginationLinks;
    };
    unreadCount: number;
};
