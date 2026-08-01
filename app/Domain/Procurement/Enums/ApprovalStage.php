<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Enums;

enum ApprovalStage: string
{
    case ManagerReview = 'manager_review';
    case ProcurementReview = 'procurement_review';
}
