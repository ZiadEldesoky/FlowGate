<?php

declare(strict_types=1);

namespace App\Domain\Organization\Enums;

enum UserRole: string
{
    case Requester = 'requester';
    case Manager = 'manager';
    case Procurement = 'procurement';
    case Administrator = 'administrator';
}
