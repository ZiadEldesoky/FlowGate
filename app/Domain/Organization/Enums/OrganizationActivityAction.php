<?php

declare(strict_types=1);

namespace App\Domain\Organization\Enums;

enum OrganizationActivityAction: string
{
    case DepartmentCreated = 'department_created';
    case DepartmentUpdated = 'department_updated';
    case UserAssignmentUpdated = 'user_assignment_updated';
}
