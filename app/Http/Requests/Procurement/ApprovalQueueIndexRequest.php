<?php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class ApprovalQueueIndexRequest extends FormRequest
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
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array{search: string|null, page: int}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => isset($validated['search'])
                ? (string) $validated['search']
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

        $this->merge([
            'search' => $search === '' ? null : $search,
        ]);
    }
}
