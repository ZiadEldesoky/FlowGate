<?php

declare(strict_types=1);

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\User;
use App\Notifications\PurchaseRequestTransitionNotification;
use Inertia\Testing\AssertableInertia as Assert;

function sendPurchaseRequestNotification(User $user, int $purchaseRequestId): void
{
    $user->notify(new PurchaseRequestTransitionNotification(
        purchaseRequestId: $purchaseRequestId,
        reference: 'PR-2026-000123',
        title: 'Office supplies',
        actorName: 'Nour Adel',
        action: PurchaseRequestAction::ApproveProcurementReview,
        fromStatus: PurchaseRequestStatus::PendingProcurementReview,
        toStatus: PurchaseRequestStatus::Approved,
    ));
}

it('shows the authenticated user notification inbox and unread count', function (): void {
    $user = User::factory()->create();
    sendPurchaseRequestNotification($user, 123);

    $this
        ->actingAs($user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('notifications/index')
            ->where('unreadCount', 1)
            ->where('auth.unreadNotificationsCount', 1)
            ->has('notifications.data', 1)
            ->where('notifications.data.0.purchaseRequestId', 123)
            ->where(
                'notifications.data.0.action',
                PurchaseRequestAction::ApproveProcurementReview->value,
            ));
});

it('lets an owner mark a notification as read', function (): void {
    $user = User::factory()->create();
    sendPurchaseRequestNotification($user, 123);
    $notification = $user->notifications()->firstOrFail();

    $this
        ->actingAs($user)
        ->patch(route('notifications.read', [
            'notificationId' => $notification->id,
        ]))
        ->assertRedirect();

    expect($notification->refresh()->read_at)->not->toBeNull();
});

it('does not let another user mark a notification as read', function (): void {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    sendPurchaseRequestNotification($owner, 123);
    $notification = $owner->notifications()->firstOrFail();

    $this
        ->actingAs($otherUser)
        ->patch(route('notifications.read', [
            'notificationId' => $notification->id,
        ]))
        ->assertNotFound();

    expect($notification->refresh()->read_at)->toBeNull();
});

it('marks only the authenticated users notifications as read', function (): void {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    sendPurchaseRequestNotification($user, 123);
    sendPurchaseRequestNotification($user, 124);
    sendPurchaseRequestNotification($otherUser, 125);

    $this
        ->actingAs($user)
        ->patch(route('notifications.read-all'))
        ->assertRedirect();

    expect($user->fresh()->unreadNotifications()->count())->toBe(0)
        ->and($otherUser->fresh()->unreadNotifications()->count())->toBe(1);
});
