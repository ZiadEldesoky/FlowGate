<?php

declare(strict_types=1);

namespace App\Domain\Organization\Actions;

use App\Models\User;

final class MarkAllNotificationsAsRead
{
    public function handle(User $user): void
    {
        $user->unreadNotifications()->update([
            'read_at' => now(),
        ]);
    }
}
