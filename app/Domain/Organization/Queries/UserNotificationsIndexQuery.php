<?php

declare(strict_types=1);

namespace App\Domain\Organization\Queries;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;

final class UserNotificationsIndexQuery
{
    /**
     * @return array{
     *     notifications: array{
     *         data: list<array{
     *             id: string,
     *             purchaseRequestId: int,
     *             reference: string,
     *             title: string,
     *             actorName: string,
     *             action: string,
     *             fromStatus: string,
     *             toStatus: string,
     *             readAt: string|null,
     *             createdAt: string
     *         }>,
     *         meta: array{
     *             currentPage: int,
     *             lastPage: int,
     *             from: int|null,
     *             to: int|null,
     *             total: int
     *         },
     *         links: array{previous: string|null, next: string|null}
     *     },
     *     unreadCount: int
     * }
     */
    public function for(User $user): array
    {
        $paginator = $user->notifications()
            ->latest()
            ->paginate(15)
            ->withQueryString();
        $notifications = [];

        foreach ($paginator->items() as $notification) {
            $notifications[] = $this->serialize($notification);
        }

        return [
            'notifications' => [
                'data' => $notifications,
                'meta' => [
                    'currentPage' => $paginator->currentPage(),
                    'lastPage' => $paginator->lastPage(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                    'total' => $paginator->total(),
                ],
                'links' => [
                    'previous' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ],
            'unreadCount' => $user->unreadNotifications()->count(),
        ];
    }

    /**
     * @return array{
     *     id: string,
     *     purchaseRequestId: int,
     *     reference: string,
     *     title: string,
     *     actorName: string,
     *     action: string,
     *     fromStatus: string,
     *     toStatus: string,
     *     readAt: string|null,
     *     createdAt: string
     * }
     */
    private function serialize(DatabaseNotification $notification): array
    {
        $data = $notification->data;

        return [
            'id' => (string) $notification->id,
            'purchaseRequestId' => (int) ($data['purchaseRequestId'] ?? 0),
            'reference' => (string) ($data['reference'] ?? ''),
            'title' => (string) ($data['title'] ?? ''),
            'actorName' => (string) ($data['actorName'] ?? ''),
            'action' => (string) ($data['action'] ?? ''),
            'fromStatus' => (string) ($data['fromStatus'] ?? ''),
            'toStatus' => (string) ($data['toStatus'] ?? ''),
            'readAt' => $notification->read_at?->toAtomString(),
            'createdAt' => $notification->created_at?->toAtomString() ?? '',
        ];
    }
}
