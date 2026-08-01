<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Actions;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Exceptions\PurchaseRequestCannotBeEdited;
use App\Domain\Procurement\Rules\PurchaseRequestAmounts;
use App\Models\PurchaseRequest;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

final readonly class UpdateDraftPurchaseRequest
{
    public function __construct(
        private PurchaseRequestAmounts $amounts,
    ) {}

    /**
     * @param  array{
     *     title: string,
     *     justification: string,
     *     needed_by: string|null,
     *     currency: string,
     *     items: list<array{
     *         description: string,
     *         sku: string|null,
     *         quantity: string,
     *         unit_price: string
     *     }>
     * }  $input
     */
    public function handle(
        PurchaseRequest $purchaseRequest,
        array $input,
    ): PurchaseRequest {
        $amounts = $this->amounts->calculate($input['items']);

        return DB::transaction(function () use (
            $purchaseRequest,
            $input,
            $amounts,
        ): PurchaseRequest {
            $lockedRequest = PurchaseRequest::query()
                ->lockForUpdate()
                ->findOrFail($purchaseRequest->id);

            if ($lockedRequest->status !== PurchaseRequestStatus::Draft) {
                throw PurchaseRequestCannotBeEdited::becauseStatus(
                    $lockedRequest->status,
                );
            }

            $lockedRequest->title = $input['title'];
            $lockedRequest->justification = $input['justification'];
            $lockedRequest->needed_by = $input['needed_by'] === null
                ? null
                : CarbonImmutable::parse($input['needed_by'])->startOfDay();
            $lockedRequest->currency = $input['currency'];
            $lockedRequest->total_amount = $amounts['total_amount'];
            $lockedRequest->save();

            $lockedRequest->items()->delete();
            $lockedRequest->items()->createMany($amounts['items']);

            return $lockedRequest->load([
                'department',
                'requester',
                'items',
            ]);
        }, 3);
    }
}
