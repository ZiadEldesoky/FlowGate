<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domain\Organization\Enums\UserRole;
use App\Models\OrganizationActivityLog;
use App\Models\User;

final class OrganizationActivityLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Administrator;
    }

    public function view(
        User $user,
        OrganizationActivityLog $organizationActivityLog,
    ): bool {
        return $user->role === UserRole::Administrator;
    }
}
