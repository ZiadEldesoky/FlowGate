<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domain\Organization\Enums\UserRole;
use App\Models\User;

final class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function view(User $user, User $subject): bool
    {
        return $this->isAdministrator($user);
    }

    public function update(User $user, User $subject): bool
    {
        return $this->isAdministrator($user);
    }

    public function delete(User $user, User $subject): bool
    {
        return false;
    }

    private function isAdministrator(User $user): bool
    {
        return $user->role === UserRole::Administrator;
    }
}
