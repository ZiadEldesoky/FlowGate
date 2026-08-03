<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Auth\Access\Gate;
use Illuminate\Database\Eloquent\Builder;

final readonly class PendingApprovalReviewsQuery
{
    public function __construct(
        private Gate $gate,
        private PurchaseRequestReviewSla $reviewSla,
    ) {}

    /**
     * @param  array{search: string|null, page: int}  $filters
     * @return array{
     *     reviews: array{
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
     *             isOverdue: bool
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
     *     filters: array{search: string},
     *     stage: string
     * }
     *
     * @throws AuthorizationException
     */
    public function for(User $user, array $filters): array
    {
        $stage = $this->stageFor($user);
        $status = match ($stage) {
            ApprovalStage::ManagerReview => PurchaseRequestStatus::PendingManagerReview,
            ApprovalStage::ProcurementReview => PurchaseRequestStatus::PendingProcurementReview,
        };

        $query = PurchaseRequest::query()
            ->with([
                'requester:id,name',
                'department:id,name,code',
            ])
            ->where('status', $status);

        if ($stage === ApprovalStage::ManagerReview) {
            $query->whereHas(
                'department',
                fn (Builder $department): Builder => $department->where(
                    'manager_id',
                    $user->id,
                ),
            );
        }

        $this->applySearch($query, $filters['search']);

        $paginator = $query
            ->oldest('submitted_at')
            ->oldest('id')
            ->paginate(15, ['*'], 'page', $filters['page'])
            ->appends(['search' => $filters['search']]);

        $rows = [];

        foreach ($paginator->items() as $purchaseRequest) {
            $rows[] = [
                'id' => $purchaseRequest->id,
                'reference' => $purchaseRequest->reference,
                'title' => $purchaseRequest->title,
                'requester' => [
                    'id' => $purchaseRequest->requester->id,
                    'name' => $purchaseRequest->requester->name,
                ],
                'department' => [
                    'id' => $purchaseRequest->department->id,
                    'name' => $purchaseRequest->department->name,
                    'code' => $purchaseRequest->department->code,
                ],
                'status' => $purchaseRequest->status->value,
                'currency' => $purchaseRequest->currency,
                'totalAmount' => $purchaseRequest->total_amount,
                'neededBy' => $purchaseRequest->needed_by?->toDateString(),
                'submittedAt' => $purchaseRequest->submitted_at?->toAtomString(),
                'reviewDueAt' => $purchaseRequest->review_due_at?->toAtomString(),
                'isOverdue' => $this->reviewSla->isOverdue(
                    $purchaseRequest->review_due_at,
                    now(),
                ),
            ];
        }

        return [
            'reviews' => [
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
            'stage' => $stage->value,
        ];
    }

    /**
     * @throws AuthorizationException
     */
    private function stageFor(User $user): ApprovalStage
    {
        $gate = $this->gate->forUser($user);

        if ($gate->allows('viewManagerApprovalQueue', PurchaseRequest::class)) {
            return ApprovalStage::ManagerReview;
        }

        if ($gate->allows('viewProcurementApprovalQueue', PurchaseRequest::class)) {
            return ApprovalStage::ProcurementReview;
        }

        throw new AuthorizationException;
    }

    /**
     * @param  Builder<PurchaseRequest>  $query
     */
    private function applySearch(Builder $query, ?string $search): void
    {
        if ($search === null) {
            return;
        }

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
                    fn (Builder $department): Builder => $department
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%"),
                );
        });
    }
}
