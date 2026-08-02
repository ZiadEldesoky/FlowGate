<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Domain\Procurement\Events\PurchaseRequestTransitioned;
use App\Domain\Procurement\Queries\PurchaseRequestNotificationRecipientsQuery;
use App\Models\PurchaseRequest;
use App\Models\User;
use App\Notifications\PurchaseRequestTransitionNotification;
use Illuminate\Support\Facades\Notification;

final readonly class SendPurchaseRequestTransitionNotifications
{
    public function __construct(
        private PurchaseRequestNotificationRecipientsQuery $recipients,
    ) {}

    public function handle(PurchaseRequestTransitioned $event): void
    {
        $purchaseRequest = PurchaseRequest::query()
            ->with('department:id,manager_id')
            ->findOrFail($event->purchaseRequestId);
        $actor = User::query()->findOrFail($event->actorId);
        $recipients = $this->recipients->for(
            purchaseRequest: $purchaseRequest,
            actor: $actor,
            action: $event->action,
            fromStatus: $event->fromStatus,
        );

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send(
            $recipients,
            new PurchaseRequestTransitionNotification(
                purchaseRequestId: $purchaseRequest->id,
                reference: $purchaseRequest->reference,
                title: $purchaseRequest->title,
                actorName: $actor->name,
                action: $event->action,
                fromStatus: $event->fromStatus,
                toStatus: $event->toStatus,
            ),
        );
    }
}
