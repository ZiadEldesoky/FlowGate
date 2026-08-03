<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\PurchaseRequest;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Database\Eloquent\Collection;

final class OverduePurchaseRequestReviewsQuery
{
    /**
     * @param  Closure(int): void  $callback
     */
    public function eachDueAt(
        CarbonInterface $asOf,
        Closure $callback,
    ): int {
        $count = 0;

        PurchaseRequest::query()
            ->select('id')
            ->whereIn('status', [
                PurchaseRequestStatus::PendingManagerReview->value,
                PurchaseRequestStatus::PendingProcurementReview->value,
            ])
            ->whereNotNull('review_due_at')
            ->where('review_due_at', '<=', $asOf)
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
                        $callback($purchaseRequest->id);
                        $count++;
                    }
                },
            );

        return $count;
    }
}
