<?php

declare(strict_types=1);

namespace App\Domain\Organization\Actions;

use App\Domain\Organization\Enums\OrganizationActivityAction;
use App\Domain\Organization\Enums\OrganizationSubjectType;
use App\Models\Department;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class CreateDepartment
{
    public function __construct(
        private RecordOrganizationActivity $recordActivity,
    ) {}

    /**
     * @param  array{name: string, code: string}  $input
     */
    public function handle(User $actor, array $input): Department
    {
        return DB::transaction(function () use ($actor, $input): Department {
            $department = Department::query()->create([
                'name' => $input['name'],
                'code' => $input['code'],
                'manager_id' => null,
            ]);

            $this->recordActivity->handle(
                actor: $actor,
                action: OrganizationActivityAction::DepartmentCreated,
                subjectType: OrganizationSubjectType::Department,
                subjectId: $department->id,
                subjectLabel: $this->label($department),
                changes: [
                    [
                        'field' => 'name',
                        'from' => null,
                        'to' => $department->name,
                    ],
                    [
                        'field' => 'code',
                        'from' => null,
                        'to' => $department->code,
                    ],
                ],
            );

            return $department;
        }, 3);
    }

    private function label(Department $department): string
    {
        return sprintf('%s (%s)', $department->name, $department->code);
    }
}
