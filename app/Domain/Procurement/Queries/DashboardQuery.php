<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\User;

final readonly class DashboardQuery
{
    public function __construct(
        private VisiblePurchaseRequestsQuery $visiblePurchaseRequests,
        private PurchaseRequestListItemQuery $listItem,
    ) {}

    /**
     * @return array{
     *     scope: string,
     *     summary: array{
     *         totalRequests: int,
     *         openRequests: int,
     *         actionRequiredCount: int,
     *         completedRequests: int,
     *         committedAmount: string,
     *         currency: string
     *     },
     *     statusBreakdown: list<array{status: string, count: int}>,
     *     attentionRequests: list<array{
     *         id: int,
     *         reference: string,
     *         title: string,
     *         requester: array{id: int, name: string},
     *         department: array{id: int, name: string, code: string},
     *         status: string,
     *         currency: string,
     *         totalAmount: string,
     *         neededBy: string|null,
     *         submittedAt: string|null,
     *         createdAt: string
     *     }>,
     *     recentRequests: list<array{
     *         id: int,
     *         reference: string,
     *         title: string,
     *         requester: array{id: int, name: string},
     *         department: array{id: int, name: string, code: string},
     *         status: string,
     *         currency: string,
     *         totalAmount: string,
     *         neededBy: string|null,
     *         submittedAt: string|null,
     *         createdAt: string
     *     }>
     * }
     */
    public function for(User $user): array
    {
        $visible = $this->visiblePurchaseRequests->for($user);
        $actionRequiredStatuses = $this->actionRequiredStatuses($user);
        $openStatuses = [
            PurchaseRequestStatus::Draft,
            PurchaseRequestStatus::PendingManagerReview,
            PurchaseRequestStatus::PendingProcurementReview,
            PurchaseRequestStatus::Approved,
        ];
        $committedStatuses = [
            PurchaseRequestStatus::Approved,
            PurchaseRequestStatus::Completed,
        ];

        $statusCounts = array_fill_keys(
            array_map(
                static fn (
                    PurchaseRequestStatus $status,
                ): string => $status->value,
                PurchaseRequestStatus::cases(),
            ),
            0,
        );

        $groupedStatuses = (clone $visible)
            ->select('status')
            ->selectRaw('COUNT(*) as request_count')
            ->groupBy('status')
            ->get();

        foreach ($groupedStatuses as $groupedStatus) {
            $statusCounts[$groupedStatus->status->value] = (int) $groupedStatus
                ->getAttribute('request_count');
        }

        $attentionRequests = (clone $visible)
            ->with([
                'requester:id,name',
                'department:id,name,code',
            ])
            ->whereIn('status', $this->statusValues($actionRequiredStatuses))
            ->oldest('created_at')
            ->limit(5)
            ->get();

        $recentRequests = (clone $visible)
            ->with([
                'requester:id,name',
                'department:id,name,code',
            ])
            ->latest('id')
            ->limit(5)
            ->get();

        return [
            'scope' => $this->visiblePurchaseRequests
                ->scopeFor($user)
                ->value,
            'summary' => [
                'totalRequests' => (clone $visible)->count(),
                'openRequests' => (clone $visible)
                    ->whereIn('status', $this->statusValues($openStatuses))
                    ->count(),
                'actionRequiredCount' => (clone $visible)
                    ->whereIn(
                        'status',
                        $this->statusValues($actionRequiredStatuses),
                    )
                    ->count(),
                'completedRequests' => (clone $visible)
                    ->where('status', PurchaseRequestStatus::Completed->value)
                    ->count(),
                'committedAmount' => $this->formatMoney(
                    (clone $visible)
                        ->whereIn(
                            'status',
                            $this->statusValues($committedStatuses),
                        )
                        ->sum('total_amount'),
                ),
                'currency' => 'EGP',
            ],
            'statusBreakdown' => array_map(
                static fn (
                    PurchaseRequestStatus $status,
                ): array => [
                    'status' => $status->value,
                    'count' => $statusCounts[$status->value],
                ],
                PurchaseRequestStatus::cases(),
            ),
            'attentionRequests' => array_values(
                $attentionRequests
                    ->map($this->listItem->from(...))
                    ->all(),
            ),
            'recentRequests' => array_values(
                $recentRequests
                    ->map($this->listItem->from(...))
                    ->all(),
            ),
        ];
    }

    /**
     * @return list<PurchaseRequestStatus>
     */
    private function actionRequiredStatuses(User $user): array
    {
        return match ($user->role) {
            UserRole::Requester => [
                PurchaseRequestStatus::Draft,
            ],
            UserRole::Manager => [
                PurchaseRequestStatus::PendingManagerReview,
            ],
            UserRole::Procurement,
            UserRole::Administrator => [
                PurchaseRequestStatus::PendingProcurementReview,
                PurchaseRequestStatus::Approved,
            ],
        };
    }

    /**
     * @param  list<PurchaseRequestStatus>  $statuses
     * @return list<string>
     */
    private function statusValues(array $statuses): array
    {
        return array_map(
            static fn (
                PurchaseRequestStatus $status,
            ): string => $status->value,
            $statuses,
        );
    }

    private function formatMoney(mixed $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
