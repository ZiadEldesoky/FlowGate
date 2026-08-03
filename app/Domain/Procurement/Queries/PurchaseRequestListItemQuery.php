<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use App\Models\PurchaseRequest;

final readonly class PurchaseRequestListItemQuery
{
    public function __construct(
        private PurchaseRequestReviewSla $reviewSla,
    ) {}

    /**
     * @return array{
     *     id: int,
     *     reference: string,
     *     title: string,
     *     requester: array{id: int, name: string},
     *     department: array{id: int, name: string, code: string},
     *     status: string,
     *     currency: string,
     *     totalAmount: string,
     *     neededBy: string|null,
     *     submittedAt: string|null,
     *     reviewDueAt: string|null,
     *     isOverdue: bool,
     *     createdAt: string
     * }
     */
    public function from(PurchaseRequest $purchaseRequest): array
    {
        return [
            'id' => $purchaseRequest->id,
            'reference' => $purchaseRequest->reference,
            'title' => $purchaseRequest->title,
            'requester' => [
                'id' => $purchaseRequest->requester->id,
                'name' => $purchaseRequest->requester->name,
            ],
            'department' => [
                'id' => $purchaseRequest->department->id,
                'name' => $purchaseRequest->department->name,
                'code' => $purchaseRequest->department->code,
            ],
            'status' => $purchaseRequest->status->value,
            'currency' => $purchaseRequest->currency,
            'totalAmount' => $purchaseRequest->total_amount,
            'neededBy' => $purchaseRequest->needed_by?->toDateString(),
            'submittedAt' => $purchaseRequest->submitted_at?->toAtomString(),
            'reviewDueAt' => $purchaseRequest->review_due_at?->toAtomString(),
            'isOverdue' => $this->reviewSla->isOverdue(
                $purchaseRequest->review_due_at,
                now(),
            ),
            'createdAt' => $purchaseRequest->created_at?->toAtomString() ?? '',
        ];
    }
}
