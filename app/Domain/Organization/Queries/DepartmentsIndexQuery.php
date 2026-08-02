<?php

declare(strict_types=1);

namespace App\Domain\Organization\Queries;

use App\Domain\Organization\Enums\UserRole;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

final class DepartmentsIndexQuery
{
    /**
     * @param  array{search: string|null, page: int}  $filters
     * @return array{
     *     departments: array{
     *         data: list<array{
     *             id: int,
     *             name: string,
     *             code: string,
     *             manager: array{id: int, name: string, email: string}|null,
     *             usersCount: int,
     *             purchaseRequestsCount: int,
     *             managerCandidates: list<array{id: int, name: string, email: string}>,
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
     *     filters: array{search: string}
     * }
     */
    public function for(array $filters): array
    {
        $query = Department::query()
            ->with([
                'manager:id,name,email',
                'users' => fn ($users) => $users
                    ->where('role', UserRole::Manager->value)
                    ->orderBy('name')
                    ->select([
                        'id',
                        'department_id',
                        'name',
                        'email',
                    ]),
            ])
            ->withCount([
                'users',
                'purchaseRequests',
            ]);

        $this->applySearch($query, $filters['search']);

        $paginator = $query
            ->orderBy('name')
            ->paginate(15, ['*'], 'page', $filters['page'])
            ->appends(['search' => $filters['search']]);
        $rows = [];

        foreach ($paginator->items() as $department) {
            $managerCandidates = [];

            foreach ($department->users as $candidate) {
                $managerCandidates[] = $this->managerCandidate($candidate);
            }

            $rows[] = [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'manager' => $department->manager === null
                    ? null
                    : $this->managerCandidate($department->manager),
                'usersCount' => (int) $department->getAttribute('users_count'),
                'purchaseRequestsCount' => (int) $department->getAttribute(
                    'purchase_requests_count',
                ),
                'managerCandidates' => $managerCandidates,
                'updatedAt' => $department->updated_at?->toAtomString() ?? '',
            ];
        }

        return [
            'departments' => [
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
            ],
        ];
    }

    /**
     * @param  Builder<Department>  $query
     */
    private function applySearch(Builder $query, ?string $search): void
    {
        if ($search === null) {
            return;
        }

        $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        });
    }

    /**
     * @return array{id: int, name: string, email: string}
     */
    private function managerCandidate(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}
