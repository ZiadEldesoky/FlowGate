<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Actions;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Rules\PurchaseRequestAmounts;
use App\Models\PurchaseRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final readonly class CreatePurchaseRequest
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
    public function handle(User $requester, array $input): PurchaseRequest
    {
        if ($requester->department_id === null) {
            throw new DomainException(
                'A requester must belong to a department.',
            );
        }

        $amounts = $this->amounts->calculate($input['items']);

        return DB::transaction(function () use (
            $requester,
            $input,
            $amounts,
        ): PurchaseRequest {
            $purchaseRequest = new PurchaseRequest;
            $purchaseRequest->department_id = $requester->department_id;
            $purchaseRequest->requester_id = $requester->id;
            $purchaseRequest->reference = $this->temporaryReference();
            $purchaseRequest->title = $input['title'];
            $purchaseRequest->justification = $input['justification'];
            $purchaseRequest->needed_by = $input['needed_by'] === null
                ? null
                : CarbonImmutable::parse($input['needed_by'])->startOfDay();
            $purchaseRequest->status = PurchaseRequestStatus::Draft;
            $purchaseRequest->currency = $input['currency'];
            $purchaseRequest->total_amount = $amounts['total_amount'];
            $purchaseRequest->save();

            $purchaseRequest->reference = sprintf(
                'PR-%s-%06d',
                now()->format('Y'),
                $purchaseRequest->id,
            );
            $purchaseRequest->save();

            $purchaseRequest->items()->createMany($amounts['items']);

            return $purchaseRequest->load([
                'department',
                'requester',
                'items',
            ]);
        }, 3);
    }

    private function temporaryReference(): string
    {
        return 'TMP-'.Str::upper(Str::random(20));
    }
}
