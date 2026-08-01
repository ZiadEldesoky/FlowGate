<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Exceptions;

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use DomainException;

final class InvalidPurchaseRequestTransition extends DomainException
{
    public static function for(
        PurchaseRequestStatus $status,
        PurchaseRequestAction $action,
    ): self {
        return new self(sprintf(
            'Action [%s] is not allowed while the purchase request is [%s].',
            $action->value,
            $status->value,
        ));
    }
}
