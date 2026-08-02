<?php

declare(strict_types=1);

namespace App\Http\Requests\Organization;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateDepartmentRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'code' => [
                'required',
                'string',
                'max:30',
                'regex:/^[A-Z0-9][A-Z0-9_-]*$/',
                Rule::unique('departments', 'code')->ignore(
                    $this->route('departmentId'),
                ),
            ],
            'manager_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => app()->isLocale('ar') ? 'اسم القسم' : 'department name',
            'code' => app()->isLocale('ar') ? 'رمز القسم' : 'department code',
            'manager_id' => app()->isLocale('ar')
                ? 'مدير القسم'
                : 'department manager',
        ];
    }

    /**
     * @return array{name: string, code: string, manager_id: int|null}
     */
    public function payload(): array
    {
        $managerId = $this->validated('manager_id');

        return [
            'name' => (string) $this->validated('name'),
            'code' => (string) $this->validated('code'),
            'manager_id' => is_numeric($managerId)
                ? (int) $managerId
                : null,
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
        $managerId = $this->input('manager_id');

        $this->merge([
            'name' => trim((string) $this->input('name', '')),
            'code' => strtoupper(trim((string) $this->input('code', ''))),
            'manager_id' => $managerId === '' ? null : $managerId,
        ]);
    }
}
