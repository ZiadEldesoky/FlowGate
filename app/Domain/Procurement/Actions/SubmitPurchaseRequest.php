<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Actions;

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Models\PurchaseRequest;
use App\Models\User;

final readonly class SubmitPurchaseRequest
{
    public function __construct(
        private TransitionPurchaseRequest $transition,
    ) {}

    public function handle(
        PurchaseRequest $purchaseRequest,
        User $actor,
    ): PurchaseRequest {
        return $this->transition->handle(
            purchaseRequest: $purchaseRequest,
            actor: $actor,
            action: PurchaseRequestAction::Submit,
        );
    }
}
