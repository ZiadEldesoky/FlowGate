<?php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class PurchaseRequestIndexRequest extends FormRequest
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
            'search' => ['nullable', 'string', 'max:120'],
            'status' => [
                'nullable',
                Rule::enum(PurchaseRequestStatus::class),
            ],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array{
     *     search: string|null,
     *     status: PurchaseRequestStatus|null,
     *     page: int
     * }
     */
    public function filters(): array
    {
        $validated = $this->validated();
        $status = $validated['status'] ?? null;

        return [
            'search' => isset($validated['search'])
                ? (string) $validated['search']
                : null,
            'status' => is_string($status)
                ? PurchaseRequestStatus::from($status)
                : null,
            'page' => isset($validated['page'])
                ? (int) $validated['page']
                : 1,
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
        $search = trim((string) $this->input('search', ''));
        $status = trim((string) $this->input('status', ''));

        $this->merge([
            'search' => $search === '' ? null : $search,
            'status' => $status === '' ? null : $status,
        ]);
    }
}
