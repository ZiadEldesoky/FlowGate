<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Enums;

enum PurchaseRequestScope: string
{
    case OwnRequests = 'own_requests';
    case ManagedDepartments = 'managed_departments';
    case AllRequests = 'all_requests';
}
