<?php

declare(strict_types=1);

use App\Domain\Procurement\Rules\PurchaseRequestAmounts;

it('calculates item lines and totals with decimal precision', function (): void {
    $result = app(PurchaseRequestAmounts::class)->calculate([
        [
            'description' => 'Packaging units',
            'sku' => ' PKG-01 ',
            'quantity' => '2.500',
            'unit_price' => '19.99',
        ],
        [
            'description' => 'Safety labels',
            'sku' => null,
            'quantity' => '0.333',
            'unit_price' => '10',
        ],
    ]);

    expect($result['items'])->toBe([
        [
            'description' => 'Packaging units',
            'sku' => 'PKG-01',
            'quantity' => '2.500',
            'unit_price' => '19.99',
            'line_total' => '49.98',
            'position' => 1,
        ],
        [
            'description' => 'Safety labels',
            'sku' => null,
            'quantity' => '0.333',
            'unit_price' => '10.00',
            'line_total' => '3.33',
            'position' => 2,
        ],
    ])->and($result['total_amount'])->toBe('53.31');
});

it('requires at least one valid item', function (): void {
    expect(
        fn (): array => app(PurchaseRequestAmounts::class)->calculate([]),
    )->toThrow(InvalidArgumentException::class);
});
