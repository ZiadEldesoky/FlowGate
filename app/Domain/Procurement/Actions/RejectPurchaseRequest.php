<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Actions;

use App\Domain\Procurement\Enums\ApprovalDecision;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Models\PurchaseRequest;
use App\Models\User;
use InvalidArgumentException;

final readonly class RejectPurchaseRequest
{
    public function __construct(
        private TransitionPurchaseRequest $transition,
    ) {}

    public function handle(
        PurchaseRequest $purchaseRequest,
        User $actor,
        string $reason,
    ): PurchaseRequest {
        if (trim($reason) === '') {
            throw new InvalidArgumentException('A rejection reason is required.');
        }

        return $this->transition->handle(
            purchaseRequest: $purchaseRequest,
            actor: $actor,
            action: PurchaseRequestAction::Reject,
            decision: ApprovalDecision::Rejected,
            comment: $reason,
        );
    }
}
