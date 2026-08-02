<?php

declare(strict_types=1);

namespace App\Domain\Organization\Actions;

use App\Domain\Organization\Enums\OrganizationActivityAction;
use App\Domain\Organization\Enums\OrganizationSubjectType;
use App\Domain\Organization\Enums\UserRole;
use App\Models\Department;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final readonly class UpdateDepartment
{
    public function __construct(
        private RecordOrganizationActivity $recordActivity,
    ) {}

    /**
     * @param  array{name: string, code: string, manager_id: int|null}  $input
     *
     * @throws ValidationException
     */
    public function handle(
        Department $department,
        User $actor,
        array $input,
    ): Department {
        return DB::transaction(function () use (
            $department,
            $actor,
            $input,
        ): Department {
            $lockedDepartment = Department::query()
                ->with('manager:id,name')
                ->lockForUpdate()
                ->findOrFail($department->id);
            $manager = $this->managerFor(
                $lockedDepartment,
                $input['manager_id'],
            );
            $before = [
                'name' => $lockedDepartment->name,
                'code' => $lockedDepartment->code,
                'manager' => $lockedDepartment->manager?->name,
            ];

            $lockedDepartment->name = $input['name'];
            $lockedDepartment->code = $input['code'];
            $lockedDepartment->manager_id = $manager?->id;
            $lockedDepartment->save();

            $changes = $this->changes(
                $before,
                [
                    'name' => $lockedDepartment->name,
                    'code' => $lockedDepartment->code,
                    'manager' => $manager?->name,
                ],
            );

            if ($changes !== []) {
                $this->recordActivity->handle(
                    actor: $actor,
                    action: OrganizationActivityAction::DepartmentUpdated,
                    subjectType: OrganizationSubjectType::Department,
                    subjectId: $lockedDepartment->id,
                    subjectLabel: $this->label($lockedDepartment),
                    changes: $changes,
                );
            }

            return $lockedDepartment->load('manager:id,name,email');
        }, 3);
    }

    /**
     * @throws ValidationException
     */
    private function managerFor(
        Department $department,
        ?int $managerId,
    ): ?User {
        if ($managerId === null) {
            return null;
        }

        $manager = User::query()
            ->lockForUpdate()
            ->find($managerId);

        if (
            ! $manager instanceof User
            || $manager->role !== UserRole::Manager
            || $manager->department_id !== $department->id
        ) {
            throw ValidationException::withMessages([
                'manager_id' => __(
                    'The selected manager must belong to this department and have the manager role.',
                ),
            ]);
        }

        return $manager;
    }

    /**
     * @param  array{name: string, code: string, manager: string|null}  $before
     * @param  array{name: string, code: string, manager: string|null}  $after
     * @return list<array{field: string, from: string|null, to: string|null}>
     */
    private function changes(array $before, array $after): array
    {
        $changes = [];

        foreach ($after as $field => $value) {
            if ($before[$field] === $value) {
                continue;
            }

            $changes[] = [
                'field' => $field,
                'from' => $before[$field],
                'to' => $value,
            ];
        }

        return $changes;
    }

    private function label(Department $department): string
    {
        return sprintf('%s (%s)', $department->name, $department->code);
    }
}
