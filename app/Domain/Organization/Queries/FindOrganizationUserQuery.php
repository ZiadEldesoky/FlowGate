<?php

declare(strict_types=1);

namespace App\Domain\Organization\Queries;

use App\Models\User;

final class FindOrganizationUserQuery
{
    public function byId(int $id): User
    {
        return User::query()->findOrFail($id);
    }
}
