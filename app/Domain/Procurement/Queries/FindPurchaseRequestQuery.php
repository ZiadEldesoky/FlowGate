<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Models\PurchaseRequest;

final class FindPurchaseRequestQuery
{
    public function byId(int $id): PurchaseRequest
    {
        return PurchaseRequest::query()->findOrFail($id);
    }
}
