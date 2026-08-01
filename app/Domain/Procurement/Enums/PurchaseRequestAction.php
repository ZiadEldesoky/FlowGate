<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Enums;

enum PurchaseRequestAction: string
{
    case Submit = 'submit';
    case ApproveManagerReview = 'approve_manager_review';
    case ApproveProcurementReview = 'approve_procurement_review';
    case Reject = 'reject';
    case Complete = 'complete';
    case Cancel = 'cancel';
}
