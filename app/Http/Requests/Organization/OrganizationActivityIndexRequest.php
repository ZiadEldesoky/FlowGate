<?php

declare(strict_types=1);

namespace App\Http\Requests\Organization;

use App\Domain\Organization\Enums\OrganizationActivityAction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class OrganizationActivityIndexRequest extends FormRequest
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
            'action' => [
                'nullable',
                Rule::enum(OrganizationActivityAction::class),
            ],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array{
     *     search: string|null,
     *     action: OrganizationActivityAction|null,
     *     page: int
     * }
     */
    public function filters(): array
    {
        $validated = $this->validated();
        $action = $validated['action'] ?? null;

        return [
            'search' => isset($validated['search'])
                ? (string) $validated['search']
                : null,
            'action' => is_string($action)
                ? OrganizationActivityAction::from($action)
                : null,
            'page' => isset($validated['page'])
                ? (int) $validated['page']
                : 1,
        ];
    }

    protected function prepareForValidation(): void
    {
        $search = trim((string) $this->input('search', ''));
        $action = trim((string) $this->input('action', ''));

        $this->merge([
            'search' => $search === '' ? null : $search,
            'action' => $action === '' ? null : $action,
        ]);
    }
}
