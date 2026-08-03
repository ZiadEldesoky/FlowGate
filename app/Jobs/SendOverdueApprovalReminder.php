<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Queries\PurchaseRequestNotificationRecipientsQuery;
use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use App\Models\ApprovalReminder;
use App\Models\PurchaseRequest;
use App\Notifications\PurchaseRequestReviewOverdueNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

final class SendOverdueApprovalReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly int $purchaseRequestId,
        public readonly ApprovalStage $stage,
        public readonly string $reminderOn,
    ) {}

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [60, 300];
    }

    public function handle(
        PurchaseRequestReviewSla $sla,
        PurchaseRequestNotificationRecipientsQuery $recipients,
    ): void {
        DB::transaction(function () use ($sla, $recipients): void {
            $purchaseRequest = PurchaseRequest::query()
                ->with('department:id,manager_id')
                ->lockForUpdate()
                ->find($this->purchaseRequestId);

            if ($purchaseRequest === null) {
                return;
            }

            $currentStage = $sla->stageFor($purchaseRequest->status);
            $processedAt = now();

            if (
                $currentStage !== $this->stage
                || ! $sla->isOverdue(
                    $purchaseRequest->review_due_at,
                    $processedAt,
                )
            ) {
                return;
            }

            $reminder = ApprovalReminder::query()->firstOrNew([
                'purchase_request_id' => $purchaseRequest->id,
                'stage' => $currentStage,
                'reminder_on' => $this->reminderOn,
            ]);

            if ($reminder->processed_at !== null) {
                return;
            }

            $reviewers = $recipients->reviewersForStage(
                $purchaseRequest,
                $currentStage,
            );

            Notification::send(
                $reviewers,
                new PurchaseRequestReviewOverdueNotification(
                    purchaseRequestId: $purchaseRequest->id,
                    reference: $purchaseRequest->reference,
                    title: $purchaseRequest->title,
                    stage: $currentStage,
                    reviewDueAt: $purchaseRequest->review_due_at->toAtomString(),
                ),
            );

            $reminder->recipient_count = $reviewers->count();
            $reminder->processed_at = $processedAt;
            $reminder->save();
        }, 3);
    }
}
