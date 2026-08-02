<?php

declare(strict_types=1);

namespace App\Domain\Organization\Queries;

use App\Domain\Organization\Enums\UserRole;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

final class OrganizationUsersIndexQuery
{
    /**
     * @param  array{
     *     search: string|null,
     *     role: UserRole|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     * @return array{
     *     users: array{
     *         data: list<array{
     *             id: int,
     *             name: string,
     *             email: string,
     *             role: string,
     *             department: array{id: int, name: string, code: string}|null,
     *             managedDepartments: list<array{id: int, name: string, code: string}>,
     *             updatedAt: string
     *         }>,
     *         meta: array{
     *             currentPage: int,
     *             lastPage: int,
     *             from: int|null,
     *             to: int|null,
     *             total: int
     *         },
     *         links: array{previous: string|null, next: string|null}
     *     },
     *     filters: array{
     *         search: string,
     *         role: string,
     *         departmentId: int|null
     *     },
     *     departmentOptions: list<array{id: int, name: string, code: string}>,
     *     roleOptions: list<string>
     * }
     */
    public function for(array $filters): array
    {
        $query = User::query()->with([
            'department:id,name,code',
            'managedDepartments:id,name,code,manager_id',
        ]);

        $this->applyFilters($query, $filters);

        $paginator = $query
            ->orderBy('name')
            ->paginate(15, ['*'], 'page', $filters['page'])
            ->appends([
                'search' => $filters['search'],
                'role' => $filters['role']?->value,
                'department_id' => $filters['department_id'],
            ]);
        $rows = [];

        foreach ($paginator->items() as $user) {
            $managedDepartments = [];

            foreach ($user->managedDepartments as $department) {
                $managedDepartments[] = $this->department($department);
            }

            $rows[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'department' => $user->department === null
                    ? null
                    : $this->department($user->department),
                'managedDepartments' => $managedDepartments,
                'updatedAt' => $user->updated_at?->toAtomString() ?? '',
            ];
        }

        $departmentOptions = [];

        foreach (
            Department::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code']) as $department
        ) {
            $departmentOptions[] = $this->department($department);
        }

        return [
            'users' => [
                'data' => $rows,
                'meta' => [
                    'currentPage' => $paginator->currentPage(),
                    'lastPage' => $paginator->lastPage(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                    'total' => $paginator->total(),
                ],
                'links' => [
                    'previous' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ],
            'filters' => [
                'search' => $filters['search'] ?? '',
                'role' => $filters['role'] === null
                    ? ''
                    : $filters['role']->value,
                'departmentId' => $filters['department_id'],
            ],
            'departmentOptions' => $departmentOptions,
            'roleOptions' => array_map(
                static fn (UserRole $role): string => $role->value,
                UserRole::cases(),
            ),
        ];
    }

    /**
     * @param  Builder<User>  $query
     * @param  array{
     *     search: string|null,
     *     role: UserRole|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['role'] !== null) {
            $query->where('role', $filters['role']->value);
        }

        if ($filters['department_id'] !== null) {
            $query->where('department_id', $filters['department_id']);
        }

        if ($filters['search'] === null) {
            return;
        }

        $search = $filters['search'];

        $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    /**
     * @return array{id: int, name: string, code: string}
     */
    private function department(Department $department): array
    {
        return [
            'id' => $department->id,
            'name' => $department->name,
            'code' => $department->code,
        ];
    }
}
