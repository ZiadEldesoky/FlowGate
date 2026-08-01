<?php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SavePurchaseRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'justification' => ['required', 'string', 'max:5000'],
            'needed_by' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:today',
            ],
            'currency' => ['required', 'string', Rule::in(['EGP'])],
            'items' => ['required', 'array', 'min:1', 'max:25'],
            'items.*.description' => [
                'required',
                'string',
                'max:255',
            ],
            'items.*.sku' => ['nullable', 'string', 'max:80'],
            'items.*.quantity' => [
                'required',
                'numeric',
                'decimal:0,3',
                'min:0.001',
                'max:1000000',
            ],
            'items.*.unit_price' => [
                'required',
                'numeric',
                'decimal:0,2',
                'min:0.01',
                'max:1000000',
            ],
        ];
    }

    /**
     * @return array{
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
     * }
     */
    public function payload(): array
    {
        $validated = $this->validated();
        $validatedItems = $validated['items'];
        $items = [];

        if (is_array($validatedItems)) {
            foreach ($validatedItems as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $sku = $item['sku'] ?? null;

                $items[] = [
                    'description' => (string) $item['description'],
                    'sku' => is_string($sku) ? $sku : null,
                    'quantity' => (string) $item['quantity'],
                    'unit_price' => (string) $item['unit_price'],
                ];
            }
        }

        $neededBy = $validated['needed_by'] ?? null;

        return [
            'title' => (string) $validated['title'],
            'justification' => (string) $validated['justification'],
            'needed_by' => is_string($neededBy) ? $neededBy : null,
            'currency' => (string) $validated['currency'],
            'items' => $items,
        ];
    }

    /**
     * @throws AuthenticationException
     */
    public function actor(): User
    {
        $user = $this->user();

        if (! $user instanceof User) {
            throw new AuthenticationException;
        }

        return $user;
    }

    protected function prepareForValidation(): void
    {
        $items = $this->input('items');

        if (is_array($items)) {
            $items = array_map(
                static function (mixed $item): mixed {
                    if (! is_array($item)) {
                        return $item;
                    }

                    $sku = trim((string) ($item['sku'] ?? ''));

                    return [
                        ...$item,
                        'description' => trim(
                            (string) ($item['description'] ?? ''),
                        ),
                        'sku' => $sku === '' ? null : $sku,
                        'quantity' => trim(
                            (string) ($item['quantity'] ?? ''),
                        ),
                        'unit_price' => trim(
                            (string) ($item['unit_price'] ?? ''),
                        ),
                    ];
                },
                $items,
            );
        }

        $neededBy = trim((string) $this->input('needed_by', ''));

        $this->merge([
            'title' => trim((string) $this->input('title', '')),
            'justification' => trim(
                (string) $this->input('justification', ''),
            ),
            'needed_by' => $neededBy === '' ? null : $neededBy,
            'currency' => strtoupper(
                trim((string) $this->input('currency', 'EGP')),
            ),
            'items' => $items,
        ]);
    }
}
