<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Actions;

use App\Domain\Procurement\Enums\ApprovalDecision;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Models\PurchaseRequest;
use App\Models\User;

final readonly class ApproveManagerReview
{
    public function __construct(
        private TransitionPurchaseRequest $transition,
    ) {}

    public function handle(
        PurchaseRequest $purchaseRequest,
        User $actor,
        ?string $comment = null,
    ): PurchaseRequest {
        return $this->transition->handle(
            purchaseRequest: $purchaseRequest,
            actor: $actor,
            action: PurchaseRequestAction::ApproveManagerReview,
            decision: ApprovalDecision::Approved,
            comment: $comment,
        );
    }
}
