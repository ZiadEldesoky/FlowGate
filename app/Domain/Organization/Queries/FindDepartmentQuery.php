<?php

declare(strict_types=1);

namespace App\Domain\Organization\Queries;

use App\Models\Department;

final class FindDepartmentQuery
{
    public function byId(int $id): Department
    {
        return Department::query()->findOrFail($id);
    }
}
