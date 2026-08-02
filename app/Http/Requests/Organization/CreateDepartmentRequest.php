<?php

declare(strict_types=1);

namespace App\Http\Requests\Organization;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CreateDepartmentRequest extends FormRequest
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
                Rule::unique('departments', 'code'),
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
        ];
    }

    /**
     * @return array{name: string, code: string}
     */
    public function payload(): array
    {
        return [
            'name' => (string) $this->validated('name'),
            'code' => (string) $this->validated('code'),
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
        $this->merge([
            'name' => trim((string) $this->input('name', '')),
            'code' => strtoupper(trim((string) $this->input('code', ''))),
        ]);
    }
}
