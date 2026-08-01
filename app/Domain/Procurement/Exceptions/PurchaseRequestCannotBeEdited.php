<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Exceptions;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use DomainException;

final class PurchaseRequestCannotBeEdited extends DomainException
{
    public static function becauseStatus(
        PurchaseRequestStatus $status,
    ): self {
        return new self(sprintf(
            'A purchase request in status [%s] cannot be edited.',
            $status->value,
        ));
    }
}
