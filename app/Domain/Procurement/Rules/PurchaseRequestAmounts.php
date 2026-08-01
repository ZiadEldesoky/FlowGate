<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Rules;

use InvalidArgumentException;

final class PurchaseRequestAmounts
{
    private const int QUANTITY_SCALE = 3;

    private const int MONEY_SCALE = 2;

    /**
     * @param  list<array{
     *     description: string,
     *     sku: string|null,
     *     quantity: string,
     *     unit_price: string
     * }>  $items
     * @return array{
     *     items: list<array{
     *         description: string,
     *         sku: string|null,
     *         quantity: string,
     *         unit_price: string,
     *         line_total: string,
     *         position: int
     *     }>,
     *     total_amount: string
     * }
     */
    public function calculate(array $items): array
    {
        if ($items === []) {
            throw new InvalidArgumentException(
                'A purchase request must contain at least one item.',
            );
        }

        $calculatedItems = [];
        $totalCents = 0;

        foreach ($items as $index => $item) {
            $description = trim($item['description']);

            if ($description === '') {
                throw new InvalidArgumentException(
                    'Each purchase request item requires a description.',
                );
            }

            $quantity = $this->toScaledInteger(
                $item['quantity'],
                self::QUANTITY_SCALE,
            );
            $unitPrice = $this->toScaledInteger(
                $item['unit_price'],
                self::MONEY_SCALE,
            );

            if ($quantity <= 0 || $unitPrice <= 0) {
                throw new InvalidArgumentException(
                    'Item quantity and unit price must be greater than zero.',
                );
            }

            $lineTotal = intdiv(
                ($quantity * $unitPrice) + 500,
                10 ** self::QUANTITY_SCALE,
            );
            $totalCents += $lineTotal;

            $calculatedItems[] = [
                'description' => $description,
                'sku' => $this->normalizeSku($item['sku']),
                'quantity' => $this->formatScaledInteger(
                    $quantity,
                    self::QUANTITY_SCALE,
                ),
                'unit_price' => $this->formatScaledInteger(
                    $unitPrice,
                    self::MONEY_SCALE,
                ),
                'line_total' => $this->formatScaledInteger(
                    $lineTotal,
                    self::MONEY_SCALE,
                ),
                'position' => $index + 1,
            ];
        }

        return [
            'items' => $calculatedItems,
            'total_amount' => $this->formatScaledInteger(
                $totalCents,
                self::MONEY_SCALE,
            ),
        ];
    }

    private function toScaledInteger(string $value, int $scale): int
    {
        $value = trim($value);
        $pattern = sprintf('/^\d+(?:\.(\d{1,%d}))?$/', $scale);

        if (preg_match($pattern, $value, $matches) !== 1) {
            throw new InvalidArgumentException(sprintf(
                'The decimal value [%s] is invalid.',
                $value,
            ));
        }

        [$whole] = explode('.', $value, 2);
        $fraction = str_pad($matches[1] ?? '', $scale, '0');

        return ((int) $whole * (10 ** $scale)) + (int) $fraction;
    }

    private function formatScaledInteger(int $value, int $scale): string
    {
        $factor = 10 ** $scale;

        return sprintf(
            '%d.%0'.$scale.'d',
            intdiv($value, $factor),
            $value % $factor,
        );
    }

    private function normalizeSku(?string $sku): ?string
    {
        if ($sku === null) {
            return null;
        }

        $sku = trim($sku);

        return $sku === '' ? null : $sku;
    }
}
