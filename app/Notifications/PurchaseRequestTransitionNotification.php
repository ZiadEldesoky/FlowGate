<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

final class PurchaseRequestTransitionNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly int $purchaseRequestId,
        private readonly string $reference,
        private readonly string $title,
        private readonly string $actorName,
        private readonly PurchaseRequestAction $action,
        private readonly PurchaseRequestStatus $fromStatus,
        private readonly PurchaseRequestStatus $toStatus,
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
     *     actorName: string,
     *     action: string,
     *     fromStatus: string,
     *     toStatus: string
     * }
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'purchase_request_transition',
            'purchaseRequestId' => $this->purchaseRequestId,
            'reference' => $this->reference,
            'title' => $this->title,
            'actorName' => $this->actorName,
            'action' => $this->action->value,
            'fromStatus' => $this->fromStatus->value,
            'toStatus' => $this->toStatus->value,
        ];
    }
}
