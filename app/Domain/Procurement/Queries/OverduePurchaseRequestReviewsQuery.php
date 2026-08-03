<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use App\Models\ApprovalReminder;
use App\Models\PurchaseRequest;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

final class OverduePurchaseRequestReviewsQuery
{
    public function __construct(
        private readonly PurchaseRequestReviewSla $reviewSla,
    ) {}

    /**
     * @param  Closure(int, ApprovalStage): void  $callback
     */
    public function eachDueAt(
        CarbonInterface $asOf,
        string $reminderOn,
        Closure $callback,
    ): int {
        $count = 0;

        PurchaseRequest::query()
            ->select(['id', 'status'])
            ->whereIn('status', [
                PurchaseRequestStatus::PendingManagerReview->value,
                PurchaseRequestStatus::PendingProcurementReview->value,
            ])
            ->whereNotNull('review_due_at')
            ->where('review_due_at', '<=', $asOf)
            ->where(function (Builder $reviews) use ($reminderOn): void {
                $reviews
                    ->where(function (Builder $managerReviews) use (
                        $reminderOn,
                    ): void {
                        $managerReviews
                            ->where(
                                'status',
                                PurchaseRequestStatus::PendingManagerReview,
                            )
                            ->whereDoesntHave(
                                'approvalReminders',
                                /**
                                 * @param  Builder<ApprovalReminder>  $reminders
                                 */
                                fn (Builder $reminders): Builder => $reminders
                                    ->where(
                                        'stage',
                                        ApprovalStage::ManagerReview,
                                    )
                                    ->where('reminder_on', $reminderOn)
                                    ->whereNotNull('processed_at'),
                            );
                    })
                    ->orWhere(function (Builder $procurementReviews) use (
                        $reminderOn,
                    ): void {
                        $procurementReviews
                            ->where(
                                'status',
                                PurchaseRequestStatus::PendingProcurementReview,
                            )
                            ->whereDoesntHave(
                                'approvalReminders',
                                /**
                                 * @param  Builder<ApprovalReminder>  $reminders
                                 */
                                fn (Builder $reminders): Builder => $reminders
                                    ->where(
                                        'stage',
                                        ApprovalStage::ProcurementReview,
                                    )
                                    ->where('reminder_on', $reminderOn)
                                    ->whereNotNull('processed_at'),
                            );
                    });
            })
            ->chunkById(
                100,
                /**
                 * @param  Collection<int, PurchaseRequest>  $purchaseRequests
                 */
                function (Collection $purchaseRequests) use (
                    $callback,
                    &$count,
                ): void {
                    foreach ($purchaseRequests as $purchaseRequest) {
                        $stage = $this->reviewSla->stageFor(
                            $purchaseRequest->status,
                        );

                        if ($stage === null) {
                            continue;
                        }

                        $callback($purchaseRequest->id, $stage);
                        $count++;
                    }
                },
            );

        return $count;
    }
}
