<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Actions\ApproveManagerReview;
use App\Domain\Procurement\Actions\ApproveProcurementReview;
use App\Domain\Procurement\Actions\SubmitPurchaseRequest;
use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Queries\PurchaseRequestNotificationRecipientsQuery;
use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use App\Jobs\SendOverdueApprovalReminder;
use App\Models\ApprovalReminder;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use App\Notifications\PurchaseRequestReviewOverdueNotification;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;

afterEach(function (): void {
    Carbon::setTestNow();
});

it('sets and clears review deadlines with workflow transitions', function (): void {
    Event::fake();
    config()->set('procurement.review_sla_hours.manager_review', 24);
    config()->set('procurement.review_sla_hours.procurement_review', 48);

    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    Carbon::setTestNow('2026-08-03 09:30:00');
    $purchaseRequest = app(SubmitPurchaseRequest::class)->handle(
        $purchaseRequest,
        $requester,
    );

    expect($purchaseRequest->review_due_at?->toDateTimeString())
        ->toBe('2026-08-04 09:30:00');

    Carbon::setTestNow('2026-08-03 12:00:00');
    $purchaseRequest = app(ApproveManagerReview::class)->handle(
        $purchaseRequest,
        $manager,
    );

    expect($purchaseRequest->review_due_at?->toDateTimeString())
        ->toBe('2026-08-05 12:00:00');

    Carbon::setTestNow('2026-08-04 08:00:00');
    $purchaseRequest = app(ApproveProcurementReview::class)->handle(
        $purchaseRequest,
        $procurement,
    );

    expect($purchaseRequest->review_due_at)->toBeNull();
});

it('dispatches jobs only for currently overdue reviews', function (): void {
    Bus::fake([SendOverdueApprovalReminder::class]);
    Carbon::setTestNow('2026-08-03 12:00:00');

    $overdue = PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingManagerReview,
        'review_due_at' => now()->subMinute(),
    ]);
    PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingProcurementReview,
        'review_due_at' => now()->addMinute(),
    ]);
    PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::Approved,
        'review_due_at' => now()->subDay(),
    ]);

    $this->artisan('procurement:dispatch-overdue-review-reminders')
        ->expectsOutput('Dispatched 1 overdue approval reminder job(s).')
        ->assertSuccessful();

    Bus::assertDispatchedTimes(SendOverdueApprovalReminder::class, 1);
    Bus::assertDispatched(
        SendOverdueApprovalReminder::class,
        fn (SendOverdueApprovalReminder $job): bool => $job->purchaseRequestId
            === $overdue->id
            && $job->reminderOn === '2026-08-03',
    );
});

it('atomically sends one manager reminder per request stage and day', function (): void {
    Carbon::setTestNow('2026-08-03 12:00:00');

    $department = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $otherManager = User::factory()->create([
        'role' => UserRole::Manager,
    ]);
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
        'review_due_at' => now()->subHour(),
    ]);
    $job = new SendOverdueApprovalReminder(
        $purchaseRequest->id,
        '2026-08-03',
    );

    $job->handle(
        app(PurchaseRequestReviewSla::class),
        app(PurchaseRequestNotificationRecipientsQuery::class),
    );
    $job->handle(
        app(PurchaseRequestReviewSla::class),
        app(PurchaseRequestNotificationRecipientsQuery::class),
    );

    $reminder = ApprovalReminder::query()->sole();

    expect($manager->notifications()->count())->toBe(1)
        ->and($manager->notifications()->first()?->type)
        ->toBe(PurchaseRequestReviewOverdueNotification::class)
        ->and($otherManager->notifications()->count())->toBe(0)
        ->and($requester->notifications()->count())->toBe(0)
        ->and($reminder->stage)->toBe(ApprovalStage::ManagerReview)
        ->and($reminder->recipient_count)->toBe(1)
        ->and($reminder->processed_at)->not->toBeNull();
});

it('notifies procurement reviewers and serializes the overdue inbox contract', function (): void {
    Carbon::setTestNow('2026-08-03 12:00:00');

    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);
    $administrator = User::factory()->create([
        'role' => UserRole::Administrator,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingProcurementReview,
        'review_due_at' => now()->subHour(),
    ]);

    (new SendOverdueApprovalReminder(
        $purchaseRequest->id,
        '2026-08-03',
    ))->handle(
        app(PurchaseRequestReviewSla::class),
        app(PurchaseRequestNotificationRecipientsQuery::class),
    );

    expect($procurement->notifications()->count())->toBe(1)
        ->and($administrator->notifications()->count())->toBe(1)
        ->and($requester->notifications()->count())->toBe(0);

    $this
        ->actingAs($procurement)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where(
                'notifications.data.0.kind',
                'purchase_request_review_overdue',
            )
            ->where(
                'notifications.data.0.stage',
                ApprovalStage::ProcurementReview->value,
            )
            ->where(
                'notifications.data.0.reviewDueAt',
                $purchaseRequest->review_due_at?->toAtomString(),
            ));
});

it('exposes server-owned SLA facts in the review queue and request details', function (): void {
    Carbon::setTestNow('2026-08-03 12:00:00');

    $department = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
        'review_due_at' => now()->subHour(),
    ]);
    $reviewDueAt = $purchaseRequest->review_due_at?->toAtomString();

    $this
        ->actingAs($manager)
        ->get(route('approvals.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where('reviews.data.0.reviewDueAt', $reviewDueAt)
            ->where('reviews.data.0.isOverdue', true));

    $this
        ->actingAs($manager)
        ->get(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where('purchaseRequest.reviewDueAt', $reviewDueAt)
            ->where('purchaseRequest.isOverdue', true));
});

it('does not send a queued reminder after the request leaves review', function (): void {
    Carbon::setTestNow('2026-08-03 12:00:00');

    $purchaseRequest = PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::Approved,
        'review_due_at' => null,
    ]);

    (new SendOverdueApprovalReminder(
        $purchaseRequest->id,
        '2026-08-03',
    ))->handle(
        app(PurchaseRequestReviewSla::class),
        app(PurchaseRequestNotificationRecipientsQuery::class),
    );

    expect(ApprovalReminder::query()->count())->toBe(0);
});

it('seeds an overdue review demo idempotently', function (): void {
    Carbon::setTestNow('2026-08-03 12:00:00');

    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    $pendingManager = PurchaseRequest::query()
        ->where('status', PurchaseRequestStatus::PendingManagerReview)
        ->sole();

    expect(PurchaseRequest::query()->count())->toBe(4)
        ->and($pendingManager->review_due_at?->toDateTimeString())
        ->toBe('2026-08-03 10:00:00');
});
