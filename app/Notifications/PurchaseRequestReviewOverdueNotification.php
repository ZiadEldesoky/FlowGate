<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Domain\Procurement\Enums\ApprovalStage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

final class PurchaseRequestReviewOverdueNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly int $purchaseRequestId,
        private readonly string $reference,
        private readonly string $title,
        private readonly ApprovalStage $stage,
        private readonly string $reviewDueAt,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{
     *     kind: string,
     *     purchaseRequestId: int,
     *     reference: string,
     *     title: string,
     *     stage: string,
     *     reviewDueAt: string
     * }
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'purchase_request_review_overdue',
            'purchaseRequestId' => $this->purchaseRequestId,
            'reference' => $this->reference,
            'title' => $this->title,
            'stage' => $this->stage->value,
            'reviewDueAt' => $this->reviewDueAt,
        ];
    }
}
