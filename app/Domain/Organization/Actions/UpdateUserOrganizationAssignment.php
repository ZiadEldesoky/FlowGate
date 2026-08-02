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

final readonly class UpdateUserOrganizationAssignment
{
    public function __construct(
        private RecordOrganizationActivity $recordActivity,
    ) {}

    /**
     * @throws ValidationException
     */
    public function handle(
        User $subject,
        User $actor,
        UserRole $role,
        ?int $departmentId,
    ): User {
        return DB::transaction(function () use (
            $subject,
            $actor,
            $role,
            $departmentId,
        ): User {
            $lockedUser = User::query()
                ->with('department:id,name')
                ->lockForUpdate()
                ->findOrFail($subject->id);
            $department = $this->departmentFor($departmentId);
            $managedDepartments = Department::query()
                ->where('manager_id', $lockedUser->id)
                ->lockForUpdate()
                ->get(['id', 'name']);

            $this->assertManagerAssignmentCanChange(
                $lockedUser,
                $managedDepartments->isNotEmpty(),
                $role,
                $departmentId,
            );
            $this->assertAdministratorCanBeDemoted($lockedUser, $role);

            $before = [
                'role' => $lockedUser->role->value,
                'department' => $lockedUser->department?->name,
            ];

            $lockedUser->role = $role;
            $lockedUser->department_id = $department?->id;
            $lockedUser->save();

            $changes = $this->changes(
                $before,
                [
                    'role' => $lockedUser->role->value,
                    'department' => $department?->name,
                ],
            );

            if ($changes !== []) {
                $this->recordActivity->handle(
                    actor: $actor,
                    action: OrganizationActivityAction::UserAssignmentUpdated,
                    subjectType: OrganizationSubjectType::User,
                    subjectId: $lockedUser->id,
                    subjectLabel: sprintf(
                        '%s (%s)',
                        $lockedUser->name,
                        $lockedUser->email,
                    ),
                    changes: $changes,
                );
            }

            return $lockedUser->load([
                'department:id,name,code',
                'managedDepartments:id,name,code,manager_id',
            ]);
        }, 3);
    }

    /**
     * @throws ValidationException
     */
    private function departmentFor(?int $departmentId): ?Department
    {
        if ($departmentId === null) {
            return null;
        }

        $department = Department::query()
            ->lockForUpdate()
            ->find($departmentId);

        if (! $department instanceof Department) {
            throw ValidationException::withMessages([
                'department_id' => __('The selected department is invalid.'),
            ]);
        }

        return $department;
    }

    /**
     * @throws ValidationException
     */
    private function assertManagerAssignmentCanChange(
        User $user,
        bool $managesDepartment,
        UserRole $role,
        ?int $departmentId,
    ): void {
        if (
            $role === UserRole::Manager
            && $departmentId === null
        ) {
            throw ValidationException::withMessages([
                'department_id' => __(
                    'A manager must belong to a department.',
                ),
            ]);
        }

        if (
            $managesDepartment
            && (
                $role !== UserRole::Manager
                || $departmentId !== $user->department_id
            )
        ) {
            throw ValidationException::withMessages([
                'role' => __(
                    "Reassign this user's managed departments before changing their role or department.",
                ),
            ]);
        }
    }

    /**
     * @throws ValidationException
     */
    private function assertAdministratorCanBeDemoted(
        User $user,
        UserRole $role,
    ): void {
        if (
            $user->role !== UserRole::Administrator
            || $role === UserRole::Administrator
        ) {
            return;
        }

        $administratorIds = User::query()
            ->where('role', UserRole::Administrator)
            ->lockForUpdate()
            ->pluck('id');

        if ($administratorIds->count() <= 1) {
            throw ValidationException::withMessages([
                'role' => __('The last administrator cannot be demoted.'),
            ]);
        }
    }

    /**
     * @param  array{role: string, department: string|null}  $before
     * @param  array{role: string, department: string|null}  $after
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
}
