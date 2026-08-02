<?php

declare(strict_types=1);

namespace App\Domain\Organization\Queries;

use App\Domain\Organization\Enums\OrganizationActivityAction;
use App\Models\OrganizationActivityLog;
use Illuminate\Database\Eloquent\Builder;

final class OrganizationActivityIndexQuery
{
    /**
     * @param  array{
     *     search: string|null,
     *     action: OrganizationActivityAction|null,
     *     page: int
     * }  $filters
     * @return array{
     *     activities: array{
     *         data: list<array{
     *             id: int,
     *             action: string,
     *             actor: array{id: int, name: string},
     *             subjectType: string,
     *             subjectId: int,
     *             subjectLabel: string,
     *             changes: list<array{
     *                 field: string,
     *                 from: string|null,
     *                 to: string|null
     *             }>,
     *             createdAt: string
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
     *     filters: array{search: string, action: string},
     *     actionOptions: list<string>
     * }
     */
    public function for(array $filters): array
    {
        $query = OrganizationActivityLog::query()
            ->with('actor:id,name');

        $this->applyFilters($query, $filters);

        $paginator = $query
            ->latest('id')
            ->paginate(20, ['*'], 'page', $filters['page'])
            ->appends([
                'search' => $filters['search'],
                'action' => $filters['action']?->value,
            ]);
        $rows = [];

        foreach ($paginator->items() as $activity) {
            $rows[] = [
                'id' => $activity->id,
                'action' => $activity->action->value,
                'actor' => [
                    'id' => $activity->actor->id,
                    'name' => $activity->actor->name,
                ],
                'subjectType' => $activity->subject_type->value,
                'subjectId' => $activity->subject_id,
                'subjectLabel' => $activity->subject_label,
                'changes' => $activity->changes,
                'createdAt' => $activity->created_at?->toAtomString() ?? '',
            ];
        }

        return [
            'activities' => [
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
                'action' => $filters['action'] === null
                    ? ''
                    : $filters['action']->value,
            ],
            'actionOptions' => array_map(
                static fn (
                    OrganizationActivityAction $action,
                ): string => $action->value,
                OrganizationActivityAction::cases(),
            ),
        ];
    }

    /**
     * @param  Builder<OrganizationActivityLog>  $query
     * @param  array{
     *     search: string|null,
     *     action: OrganizationActivityAction|null,
     *     page: int
     * }  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['action'] !== null) {
            $query->where('action', $filters['action']->value);
        }

        if ($filters['search'] === null) {
            return;
        }

        $search = $filters['search'];

        $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('subject_label', 'like', "%{$search}%")
                ->orWhereHas(
                    'actor',
                    fn (Builder $actor): Builder => $actor->where(
                        'name',
                        'like',
                        "%{$search}%",
                    ),
                );
        });
    }
}
