<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Events\PurchaseRequestTransitioned;
use App\Listeners\SendPurchaseRequestTransitionNotifications;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use App\Notifications\PurchaseRequestTransitionNotification;
use Illuminate\Support\Facades\Notification;

it('notifies the designated manager after submission', function (): void {
    Notification::fake();

    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    app(SendPurchaseRequestTransitionNotifications::class)->handle(
        new PurchaseRequestTransitioned(
            purchaseRequestId: $purchaseRequest->id,
            actorId: $requester->id,
            action: PurchaseRequestAction::Submit,
            fromStatus: PurchaseRequestStatus::Draft,
            toStatus: PurchaseRequestStatus::PendingManagerReview,
        ),
    );

    Notification::assertSentTo(
        $manager,
        PurchaseRequestTransitionNotification::class,
        fn (PurchaseRequestTransitionNotification $notification): bool => $notification
            ->toArray($manager)['action'] === PurchaseRequestAction::Submit->value,
    );
    Notification::assertNotSentTo(
        $requester,
        PurchaseRequestTransitionNotification::class,
    );
});

it('notifies procurement reviewers after manager approval', function (): void {
    Notification::fake();

    $manager = User::factory()->create([
        'role' => UserRole::Manager,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);
    $administrator = User::factory()->create([
        'role' => UserRole::Administrator,
    ]);
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingProcurementReview,
    ]);

    app(SendPurchaseRequestTransitionNotifications::class)->handle(
        new PurchaseRequestTransitioned(
            purchaseRequestId: $purchaseRequest->id,
            actorId: $manager->id,
            action: PurchaseRequestAction::ApproveManagerReview,
            fromStatus: PurchaseRequestStatus::PendingManagerReview,
            toStatus: PurchaseRequestStatus::PendingProcurementReview,
        ),
    );

    Notification::assertSentTo(
        [$procurement, $administrator],
        PurchaseRequestTransitionNotification::class,
    );
    Notification::assertNotSentTo(
        $requester,
        PurchaseRequestTransitionNotification::class,
    );
});

it('notifies the requester after procurement decisions and completion', function (
    PurchaseRequestAction $action,
    PurchaseRequestStatus $fromStatus,
    PurchaseRequestStatus $toStatus,
): void {
    Notification::fake();

    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $actor = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => $toStatus,
    ]);

    app(SendPurchaseRequestTransitionNotifications::class)->handle(
        new PurchaseRequestTransitioned(
            purchaseRequestId: $purchaseRequest->id,
            actorId: $actor->id,
            action: $action,
            fromStatus: $fromStatus,
            toStatus: $toStatus,
        ),
    );

    Notification::assertSentTo(
        $requester,
        PurchaseRequestTransitionNotification::class,
    );
})->with([
    'approved' => [
        PurchaseRequestAction::ApproveProcurementReview,
        PurchaseRequestStatus::PendingProcurementReview,
        PurchaseRequestStatus::Approved,
    ],
    'rejected' => [
        PurchaseRequestAction::Reject,
        PurchaseRequestStatus::PendingProcurementReview,
        PurchaseRequestStatus::Rejected,
    ],
    'completed' => [
        PurchaseRequestAction::Complete,
        PurchaseRequestStatus::Approved,
        PurchaseRequestStatus::Completed,
    ],
]);

it('notifies the active reviewers when a requester cancels', function (): void {
    Notification::fake();

    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Cancelled,
    ]);

    app(SendPurchaseRequestTransitionNotifications::class)->handle(
        new PurchaseRequestTransitioned(
            purchaseRequestId: $purchaseRequest->id,
            actorId: $requester->id,
            action: PurchaseRequestAction::Cancel,
            fromStatus: PurchaseRequestStatus::PendingManagerReview,
            toStatus: PurchaseRequestStatus::Cancelled,
        ),
    );

    Notification::assertSentTo(
        $manager,
        PurchaseRequestTransitionNotification::class,
    );
});
