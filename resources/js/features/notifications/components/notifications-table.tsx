import { Link } from '@inertiajs/react';
import { Check, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getNotificationMessage } from '@/features/notifications/i18n';
import type { NotificationCopy } from '@/features/notifications/i18n';
import { purchaseRequestRoutes } from '@/features/purchase-requests';
import { formatDateTime } from '@/features/purchase-requests/utils';
import type { AppLocale } from '@/types/locale';
import type { UserNotification } from '@/types/notifications';

type NotificationsTableProps = {
    rows: UserNotification[];
    locale: AppLocale;
    labels: NotificationCopy;
    processingId: string | null;
    onMarkRead: (notificationId: string) => void;
};

export function NotificationsTable({
    rows,
    locale,
    labels,
    processingId,
    onMarkRead,
}: NotificationsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{labels.status}</TableHead>
                    <TableHead>{labels.update}</TableHead>
                    <TableHead>{labels.request}</TableHead>
                    <TableHead>{labels.occurredAt}</TableHead>
                    <TableHead className="text-end">{labels.actions}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((notification) => {
                    const isUnread = notification.readAt === null;
                    const isProcessing = processingId === notification.id;

                    return (
                        <TableRow
                            key={notification.id}
                            className={isUnread ? 'bg-info/5' : undefined}
                        >
                            <TableCell>
                                <Badge
                                    variant={isUnread ? 'secondary' : 'outline'}
                                >
                                    {isUnread ? labels.unread : labels.read}
                                </Badge>
                            </TableCell>
                            <TableCell className="max-w-[24rem] whitespace-normal">
                                <p className="font-medium">
                                    {getNotificationMessage(
                                        notification,
                                        locale,
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {notification.title}
                                </p>
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={purchaseRequestRoutes.show(
                                        notification.purchaseRequestId,
                                    )}
                                    className="font-mono text-xs font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    {notification.reference}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatDateTime(notification.createdAt, locale)}
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    {isUnread ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                onMarkRead(notification.id)
                                            }
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <Spinner />
                                            ) : (
                                                <Check className="size-4" />
                                            )}
                                            {isProcessing
                                                ? labels.processing
                                                : labels.markRead}
                                        </Button>
                                    ) : null}
                                    <Button
                                        asChild
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Link
                                            href={purchaseRequestRoutes.show(
                                                notification.purchaseRequestId,
                                            )}
                                        >
                                            <ExternalLink className="size-4" />
                                            {labels.openRequest}
                                        </Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
