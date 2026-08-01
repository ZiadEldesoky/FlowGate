<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Events;

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;

final readonly class PurchaseRequestTransitioned implements ShouldDispatchAfterCommit
{
    use Dispatchable;

    public function __construct(
        public int $purchaseRequestId,
        public int $actorId,
        public PurchaseRequestAction $action,
        public PurchaseRequestStatus $fromStatus,
        public PurchaseRequestStatus $toStatus,
    ) {}
}
