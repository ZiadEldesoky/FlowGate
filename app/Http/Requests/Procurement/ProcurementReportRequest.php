<?php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class ProcurementReportRequest extends FormRequest
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
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:from',
                'before_or_equal:today',
            ],
            'status' => [
                'nullable',
                Rule::enum(PurchaseRequestStatus::class),
            ],
            'department_id' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return list<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->hasAny(['from', 'to'])) {
                    return;
                }

                $from = CarbonImmutable::createFromFormat(
                    '!Y-m-d',
                    (string) $this->input('from'),
                );
                $to = CarbonImmutable::createFromFormat(
                    '!Y-m-d',
                    (string) $this->input('to'),
                );

                if ($from->diffInDays($to) <= 365) {
                    return;
                }

                $validator->errors()->add(
                    'to',
                    app()->isLocale('ar')
                        ? 'يجب ألا تتجاوز فترة التقرير 366 يوماً.'
                        : 'The reporting period may not exceed 366 days.',
                );
            },
        ];
    }

    /**
     * @return array{
     *     from: string,
     *     to: string,
     *     status: PurchaseRequestStatus|null,
     *     department_id: int|null,
     *     page: int
     * }
     */
    public function filters(): array
    {
        $validated = $this->validated();
        $status = $validated['status'] ?? null;
        $departmentId = $validated['department_id'] ?? null;

        return [
            'from' => (string) $validated['from'],
            'to' => (string) $validated['to'],
            'status' => is_string($status)
                ? PurchaseRequestStatus::from($status)
                : null,
            'department_id' => is_numeric($departmentId)
                ? (int) $departmentId
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
        $today = CarbonImmutable::today();
        $from = trim((string) $this->input('from', ''));
        $to = trim((string) $this->input('to', ''));
        $status = trim((string) $this->input('status', ''));
        $departmentId = trim(
            (string) $this->input('department_id', ''),
        );

        $this->merge([
            'from' => $from === ''
                ? $today->subDays(89)->toDateString()
                : $from,
            'to' => $to === '' ? $today->toDateString() : $to,
            'status' => $status === '' ? null : $status,
            'department_id' => $departmentId === ''
                ? null
                : $departmentId,
        ]);
    }
}
