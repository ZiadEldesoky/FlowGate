<?php

declare(strict_types=1);

namespace App\Http\Requests\Organization;

use App\Domain\Organization\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class OrganizationUserIndexRequest extends FormRequest
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
            'role' => ['nullable', Rule::enum(UserRole::class)],
            'department_id' => [
                'nullable',
                'integer',
                Rule::exists('departments', 'id'),
            ],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array{
     *     search: string|null,
     *     role: UserRole|null,
     *     department_id: int|null,
     *     page: int
     * }
     */
    public function filters(): array
    {
        $validated = $this->validated();
        $role = $validated['role'] ?? null;
        $departmentId = $validated['department_id'] ?? null;

        return [
            'search' => isset($validated['search'])
                ? (string) $validated['search']
                : null,
            'role' => is_string($role) ? UserRole::from($role) : null,
            'department_id' => is_numeric($departmentId)
                ? (int) $departmentId
                : null,
            'page' => isset($validated['page'])
                ? (int) $validated['page']
                : 1,
        ];
    }

    protected function prepareForValidation(): void
    {
        $search = trim((string) $this->input('search', ''));
        $role = trim((string) $this->input('role', ''));
        $departmentId = $this->input('department_id');

        $this->merge([
            'search' => $search === '' ? null : $search,
            'role' => $role === '' ? null : $role,
            'department_id' => $departmentId === '' ? null : $departmentId,
        ]);
    }
}
