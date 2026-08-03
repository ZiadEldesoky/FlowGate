<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\Access\Gate;
use Illuminate\Database\Eloquent\Builder;

final readonly class PurchaseRequestsIndexQuery
{
    public function __construct(
        private Gate $gate,
        private VisiblePurchaseRequestsQuery $visiblePurchaseRequests,
        private PurchaseRequestListItemQuery $listItem,
    ) {}

    /**
     * @param  array{
     *     search: string|null,
     *     status: PurchaseRequestStatus|null,
     *     page: int
     * }  $filters
     * @return array{
     *     purchaseRequests: array{
     *         data: list<array{
     *             id: int,
     *             reference: string,
     *             title: string,
     *             requester: array{id: int, name: string},
     *             department: array{id: int, name: string, code: string},
     *             status: string,
     *             currency: string,
     *             totalAmount: string,
     *             neededBy: string|null,
     *             submittedAt: string|null,
     *             reviewDueAt: string|null,
     *             isOverdue: bool,
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
     *     filters: array{search: string, status: string|null},
     *     statuses: list<string>,
     *     can: array{create: bool}
     * }
     */
    public function for(User $user, array $filters): array
    {
        $query = $this->visiblePurchaseRequests
            ->for($user)
            ->with([
                'requester:id,name',
                'department:id,name,code',
            ]);

        $this->applyFilters($query, $filters);

        $paginator = $query
            ->latest('id')
            ->paginate(15, ['*'], 'page', $filters['page'])
            ->appends([
                'search' => $filters['search'],
                'status' => $filters['status']?->value,
            ]);

        $rows = [];

        foreach ($paginator->items() as $purchaseRequest) {
            $rows[] = $this->listItem->from($purchaseRequest);
        }

        return [
            'purchaseRequests' => [
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
                'status' => $filters['status']?->value,
            ],
            'statuses' => array_map(
                static fn (PurchaseRequestStatus $status): string => $status->value,
                PurchaseRequestStatus::cases(),
            ),
            'can' => [
                'create' => $this->gate
                    ->forUser($user)
                    ->allows('create', PurchaseRequest::class),
            ],
        ];
    }

    /**
     * @param  Builder<PurchaseRequest>  $query
     * @param  array{
     *     search: string|null,
     *     status: PurchaseRequestStatus|null,
     *     page: int
     * }  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['status'] !== null) {
            $query->where('status', $filters['status']);
        }

        if ($filters['search'] === null) {
            return;
        }

        $search = $filters['search'];

        $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('reference', 'like', "%{$search}%")
                ->orWhere('title', 'like', "%{$search}%")
                ->orWhereHas(
                    'requester',
                    fn (Builder $requester): Builder => $requester->where(
                        'name',
                        'like',
                        "%{$search}%",
                    ),
                )
                ->orWhereHas(
                    'department',
                    fn (Builder $department): Builder => $department->where(
                        'name',
                        'like',
                        "%{$search}%",
                    )->orWhere(
                        'code',
                        'like',
                        "%{$search}%",
                    ),
                );
        });
    }
}
