<?php

declare(strict_types=1);

namespace App\Domain\Organization\Enums;

enum OrganizationSubjectType: string
{
    case Department = 'department';
    case User = 'user';
}
