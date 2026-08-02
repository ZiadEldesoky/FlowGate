export type PurchaseRequestNotificationAction =
    | 'submit'
    | 'approve_manager_review'
    | 'approve_procurement_review'
    | 'reject'
    | 'complete'
    | 'cancel';

export type UserNotification = {
    id: string;
    purchaseRequestId: number;
    reference: string;
    title: string;
    actorName: string;
    action: PurchaseRequestNotificationAction;
    fromStatus: string;
    toStatus: string;
    readAt: string | null;
    createdAt: string;
};

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
