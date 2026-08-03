<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

final class PurchaseRequestNotificationRecipientsQuery
{
    /**
     * @return Collection<int, User>
     */
    public function reviewersForStage(
        PurchaseRequest $purchaseRequest,
        ApprovalStage $stage,
    ): Collection {
        $query = match ($stage) {
            ApprovalStage::ManagerReview => $this->managerQuery(
                $purchaseRequest,
            ),
            ApprovalStage::ProcurementReview => $this
                ->procurementReviewersQuery(),
        };

        return $query?->orderBy('id')->get() ?? new Collection;
    }

    /**
     * @return Collection<int, User>
     */
    public function for(
        PurchaseRequest $purchaseRequest,
        User $actor,
        PurchaseRequestAction $action,
        PurchaseRequestStatus $fromStatus,
    ): Collection {
        $query = match ($action) {
            PurchaseRequestAction::Submit => $this->managerQuery(
                $purchaseRequest,
            ),
            PurchaseRequestAction::ApproveManagerReview => $this
                ->procurementReviewersQuery(),
            PurchaseRequestAction::ApproveProcurementReview,
            PurchaseRequestAction::Reject,
            PurchaseRequestAction::Complete => $this->requesterQuery(
                $purchaseRequest,
            ),
            PurchaseRequestAction::Cancel => $this->cancellationReviewersQuery(
                $purchaseRequest,
                $fromStatus,
            ),
        };

        if ($query === null) {
            return new Collection;
        }

        return $query
            ->whereKeyNot($actor->id)
            ->orderBy('id')
            ->get();
    }

    /**
     * @return Builder<User>
     */
    private function requesterQuery(
        PurchaseRequest $purchaseRequest,
    ): Builder {
        return User::query()->whereKey($purchaseRequest->requester_id);
    }

    /**
     * @return Builder<User>|null
     */
    private function managerQuery(
        PurchaseRequest $purchaseRequest,
    ): ?Builder {
        $purchaseRequest->loadMissing('department:id,manager_id');
        $managerId = $purchaseRequest->department->manager_id;

        return $managerId === null
            ? null
            : User::query()->whereKey($managerId);
    }

    /**
     * @return Builder<User>
     */
    private function procurementReviewersQuery(): Builder
    {
        return User::query()->whereIn('role', [
            UserRole::Procurement->value,
            UserRole::Administrator->value,
        ]);
    }

    /**
     * @return Builder<User>|null
     */
    private function cancellationReviewersQuery(
        PurchaseRequest $purchaseRequest,
        PurchaseRequestStatus $fromStatus,
    ): ?Builder {
        return match ($fromStatus) {
            PurchaseRequestStatus::Draft => null,
            PurchaseRequestStatus::PendingManagerReview => $this
                ->managerQuery($purchaseRequest),
            PurchaseRequestStatus::PendingProcurementReview => $this
                ->procurementReviewersQuery(),
            default => null,
        };
    }
}
