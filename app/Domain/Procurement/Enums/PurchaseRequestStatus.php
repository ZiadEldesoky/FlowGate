<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Enums;

enum PurchaseRequestStatus: string
{
    case Draft = 'draft';
    case PendingManagerReview = 'pending_manager_review';
    case PendingProcurementReview = 'pending_procurement_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
