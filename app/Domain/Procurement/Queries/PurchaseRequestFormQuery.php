<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Models\PurchaseRequest;
use App\Models\User;
use DomainException;

final class PurchaseRequestFormQuery
{
    /**
     * @return array{
     *     department: array{id: int, name: string, code: string},
     *     defaults: array{currency: string}
     * }
     */
    public function defaultsFor(User $user): array
    {
        $department = $user->department;

        if ($department === null) {
            throw new DomainException(
                'A requester must belong to a department.',
            );
        }

        return [
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
            ],
            'defaults' => [
                'currency' => 'EGP',
            ],
        ];
    }

    /**
     * @return array{
     *     purchaseRequest: array{
     *         id: int,
     *         reference: string,
     *         title: string,
     *         justification: string,
     *         neededBy: string|null,
     *         currency: string,
     *         items: list<array{
     *             id: int,
     *             description: string,
     *             sku: string|null,
     *             quantity: string,
     *             unitPrice: string
     *         }>
     *     }
     * }
     */
    public function forEdit(PurchaseRequest $purchaseRequest): array
    {
        $purchaseRequest->load('items');
        $items = [];

        foreach ($purchaseRequest->items as $item) {
            $items[] = [
                'id' => $item->id,
                'description' => $item->description,
                'sku' => $item->sku,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price,
            ];
        }

        return [
            'purchaseRequest' => [
                'id' => $purchaseRequest->id,
                'reference' => $purchaseRequest->reference,
                'title' => $purchaseRequest->title,
                'justification' => $purchaseRequest->justification,
                'neededBy' => $purchaseRequest->needed_by?->toDateString(),
                'currency' => $purchaseRequest->currency,
                'items' => $items,
            ],
        ];
    }
}
