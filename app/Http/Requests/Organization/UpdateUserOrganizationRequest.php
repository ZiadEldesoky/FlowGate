<?php

declare(strict_types=1);

namespace App\Http\Requests\Organization;

use App\Domain\Organization\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateUserOrganizationRequest extends FormRequest
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
            'role' => ['required', Rule::enum(UserRole::class)],
            'department_id' => [
                Rule::requiredIf(
                    $this->input('role') === UserRole::Manager->value,
                ),
                'nullable',
                'integer',
                Rule::exists('departments', 'id'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'role' => app()->isLocale('ar') ? 'الدور' : 'role',
            'department_id' => app()->isLocale('ar') ? 'القسم' : 'department',
        ];
    }

    public function role(): UserRole
    {
        return UserRole::from((string) $this->validated('role'));
    }

    public function departmentId(): ?int
    {
        $departmentId = $this->validated('department_id');

        return is_numeric($departmentId) ? (int) $departmentId : null;
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
        $role = trim((string) $this->input('role', ''));
        $departmentId = $this->input('department_id');

        $this->merge([
            'role' => $role,
            'department_id' => $departmentId === '' ? null : $departmentId,
        ]);
    }
}
