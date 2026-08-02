<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\LazyCollection;

final readonly class ProcurementReportQuery
{
    public function __construct(
        private VisiblePurchaseRequestsQuery $visiblePurchaseRequests,
        private PurchaseRequestListItemQuery $listItem,
    ) {}

    /**
     * @param  array{
     *     from: string,
     *     to: string,
     *     status: PurchaseRequestStatus|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     * @return array{
     *     scope: string,
     *     filters: array{
     *         from: string,
     *         to: string,
     *         status: string|null,
     *         departmentId: int|null
     *     },
     *     filterOptions: array{
     *         statuses: list<string>,
     *         departments: list<array{id: int, name: string, code: string}>
     *     },
     *     summary: array{
     *         requestCount: int,
     *         totalAmount: string,
     *         averageAmount: string,
     *         completedCount: int,
     *         completionRate: string,
     *         currency: string
     *     },
     *     statusBreakdown: list<array{
     *         status: string,
     *         requestCount: int,
     *         totalAmount: string
     *     }>,
     *     departmentBreakdown: list<array{
     *         department: array{id: int, name: string, code: string},
     *         requestCount: int,
     *         totalAmount: string
     *     }>,
     *     monthlyTrend: list<array{
     *         month: string,
     *         requestCount: int,
     *         totalAmount: string
     *     }>,
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
     *     }
     * }
     */
    public function for(User $user, array $filters): array
    {
        $filtered = $this->filtered($user, $filters);
        $requestCount = (clone $filtered)->count();
        $totalAmount = (clone $filtered)->sum('total_amount');
        $completedCount = (clone $filtered)
            ->where('status', PurchaseRequestStatus::Completed->value)
            ->count();

        $paginator = (clone $filtered)
            ->with([
                'requester:id,name',
                'department:id,name,code',
            ])
            ->latest('id')
            ->paginate(20, ['*'], 'page', $filters['page'])
            ->appends([
                'from' => $filters['from'],
                'to' => $filters['to'],
                'status' => $filters['status']?->value,
                'department_id' => $filters['department_id'],
            ]);

        $rows = [];

        foreach ($paginator->items() as $purchaseRequest) {
            $rows[] = $this->listItem->from($purchaseRequest);
        }

        return [
            'scope' => $this->visiblePurchaseRequests
                ->scopeFor($user)
                ->value,
            'filters' => [
                'from' => $filters['from'],
                'to' => $filters['to'],
                'status' => $filters['status']?->value,
                'departmentId' => $filters['department_id'],
            ],
            'filterOptions' => [
                'statuses' => array_map(
                    static fn (
                        PurchaseRequestStatus $status,
                    ): string => $status->value,
                    PurchaseRequestStatus::cases(),
                ),
                'departments' => $this->departmentOptions($user),
            ],
            'summary' => [
                'requestCount' => $requestCount,
                'totalAmount' => $this->formatMoney($totalAmount),
                'averageAmount' => $this->formatMoney(
                    $requestCount === 0
                        ? 0
                        : ((float) $totalAmount / $requestCount),
                ),
                'completedCount' => $completedCount,
                'completionRate' => number_format(
                    $requestCount === 0
                        ? 0
                        : (($completedCount / $requestCount) * 100),
                    2,
                    '.',
                    '',
                ),
                'currency' => 'EGP',
            ],
            'statusBreakdown' => $this->statusBreakdown($filtered),
            'departmentBreakdown' => $this->departmentBreakdown($filtered),
            'monthlyTrend' => $this->monthlyTrend($filtered, $filters),
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
        ];
    }

    /**
     * @param  array{
     *     from: string,
     *     to: string,
     *     status: PurchaseRequestStatus|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     * @return LazyCollection<int, PurchaseRequest>
     */
    public function exportRows(User $user, array $filters): LazyCollection
    {
        return $this->filtered($user, $filters)
            ->with([
                'requester:id,name',
                'department:id,name,code',
            ])
            ->lazyByIdDesc(500);
    }

    /**
     * @param  array{
     *     from: string,
     *     to: string,
     *     status: PurchaseRequestStatus|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     * @return Builder<PurchaseRequest>
     */
    private function filtered(User $user, array $filters): Builder
    {
        $query = $this->visiblePurchaseRequests->for($user)
            ->whereDate('purchase_requests.created_at', '>=', $filters['from'])
            ->whereDate('purchase_requests.created_at', '<=', $filters['to']);

        if ($filters['status'] !== null) {
            $query->where(
                'purchase_requests.status',
                $filters['status']->value,
            );
        }

        if ($filters['department_id'] !== null) {
            $query->where(
                'purchase_requests.department_id',
                $filters['department_id'],
            );
        }

        return $query;
    }

    /**
     * @return list<array{id: int, name: string, code: string}>
     */
    private function departmentOptions(User $user): array
    {
        $query = match ($user->role) {
            UserRole::Manager => $user->managedDepartments(),
            UserRole::Procurement,
            UserRole::Administrator => Department::query(),
            UserRole::Requester => Department::query()->whereRaw('1 = 0'),
        };

        return array_values(
            $query
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(
                    static fn (Department $department): array => [
                        'id' => $department->id,
                        'name' => $department->name,
                        'code' => $department->code,
                    ],
                )
                ->all(),
        );
    }

    /**
     * @param  Builder<PurchaseRequest>  $filtered
     * @return list<array{
     *     status: string,
     *     requestCount: int,
     *     totalAmount: string
     * }>
     */
    private function statusBreakdown(Builder $filtered): array
    {
        $breakdown = [];

        foreach (PurchaseRequestStatus::cases() as $status) {
            $breakdown[$status->value] = [
                'status' => $status->value,
                'requestCount' => 0,
                'totalAmount' => '0.00',
            ];
        }

        $rows = (clone $filtered)
            ->select('status')
            ->selectRaw('COUNT(*) as request_count')
            ->selectRaw(
                'COALESCE(SUM(total_amount), 0) as aggregate_amount',
            )
            ->groupBy('status')
            ->get();

        foreach ($rows as $row) {
            $breakdown[$row->status->value] = [
                'status' => $row->status->value,
                'requestCount' => (int) $row->getAttribute('request_count'),
                'totalAmount' => $this->formatMoney(
                    $row->getAttribute('aggregate_amount'),
                ),
            ];
        }

        return array_values($breakdown);
    }

    /**
     * @param  Builder<PurchaseRequest>  $filtered
     * @return list<array{
     *     department: array{id: int, name: string, code: string},
     *     requestCount: int,
     *     totalAmount: string
     * }>
     */
    private function departmentBreakdown(Builder $filtered): array
    {
        $rows = (clone $filtered)
            ->join(
                'departments',
                'departments.id',
                '=',
                'purchase_requests.department_id',
            )
            ->select([
                'departments.id as aggregate_department_id',
                'departments.name as aggregate_department_name',
                'departments.code as aggregate_department_code',
            ])
            ->selectRaw('COUNT(*) as request_count')
            ->selectRaw(
                'COALESCE(SUM(purchase_requests.total_amount), 0) as aggregate_amount',
            )
            ->groupBy([
                'departments.id',
                'departments.name',
                'departments.code',
            ])
            ->orderByDesc('request_count')
            ->get();

        return array_values(
            $rows
                ->map(fn (PurchaseRequest $row): array => [
                    'department' => [
                        'id' => (int) $row->getAttribute(
                            'aggregate_department_id',
                        ),
                        'name' => (string) $row->getAttribute(
                            'aggregate_department_name',
                        ),
                        'code' => (string) $row->getAttribute(
                            'aggregate_department_code',
                        ),
                    ],
                    'requestCount' => (int) $row->getAttribute(
                        'request_count',
                    ),
                    'totalAmount' => $this->formatMoney(
                        $row->getAttribute('aggregate_amount'),
                    ),
                ])
                ->all(),
        );
    }

    /**
     * @param  Builder<PurchaseRequest>  $filtered
     * @param  array{
     *     from: string,
     *     to: string,
     *     status: PurchaseRequestStatus|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     * @return list<array{
     *     month: string,
     *     requestCount: int,
     *     totalAmount: string
     * }>
     */
    private function monthlyTrend(Builder $filtered, array $filters): array
    {
        $month = CarbonImmutable::createFromFormat(
            '!Y-m-d',
            $filters['from'],
        )->startOfMonth();
        $lastMonth = CarbonImmutable::createFromFormat(
            '!Y-m-d',
            $filters['to'],
        )->startOfMonth();
        $months = [];

        while ($month->lessThanOrEqualTo($lastMonth)) {
            $months[$month->format('Y-m')] = [
                'month' => $month->format('Y-m'),
                'requestCount' => 0,
                'totalAmountCents' => 0,
            ];
            $month = $month->addMonth();
        }

        $rows = (clone $filtered)
            ->select(['id', 'created_at', 'total_amount'])
            ->lazyById(500);

        foreach ($rows as $row) {
            $key = $row->created_at?->format('Y-m');

            if ($key === null || ! isset($months[$key])) {
                continue;
            }

            $months[$key]['requestCount']++;
            $months[$key]['totalAmountCents'] += $this->moneyToCents(
                $row->total_amount,
            );
        }

        return array_values(array_map(
            fn (array $entry): array => [
                'month' => (string) $entry['month'],
                'requestCount' => (int) $entry['requestCount'],
                'totalAmount' => $this->formatCents(
                    (int) $entry['totalAmountCents'],
                ),
            ],
            $months,
        ));
    }

    private function formatMoney(mixed $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }

    private function moneyToCents(string $amount): int
    {
        [$whole, $fraction] = array_pad(
            explode('.', $amount, 2),
            2,
            '',
        );

        return ((int) $whole * 100)
            + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }

    private function formatCents(int $amount): string
    {
        return sprintf(
            '%d.%02d',
            intdiv($amount, 100),
            $amount % 100,
        );
    }
}
