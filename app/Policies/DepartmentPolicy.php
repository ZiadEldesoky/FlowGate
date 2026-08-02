<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domain\Organization\Enums\UserRole;
use App\Models\Department;
use App\Models\User;

final class DepartmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function view(User $user, Department $department): bool
    {
        return $this->isAdministrator($user);
    }

    public function create(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function update(User $user, Department $department): bool
    {
        return $this->isAdministrator($user);
    }

    public function delete(User $user, Department $department): bool
    {
        return false;
    }

    private function isAdministrator(User $user): bool
    {
        return $user->role === UserRole::Administrator;
    }
}
