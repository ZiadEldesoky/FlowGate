<?php

declare(strict_types=1);

namespace App\Domain\Organization\Actions;

use App\Models\User;

final class MarkNotificationAsRead
{
    public function handle(User $user, string $notificationId): void
    {
        $notification = $user->notifications()
            ->whereKey($notificationId)
            ->firstOrFail();

        $notification->markAsRead();
    }
}
