<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Enums;

enum ApprovalDecision: string
{
    case Approved = 'approved';
    case Rejected = 'rejected';
}
