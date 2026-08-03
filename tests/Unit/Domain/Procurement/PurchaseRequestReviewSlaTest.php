<?php

declare(strict_types=1);

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use Carbon\CarbonImmutable;
use Illuminate\Config\Repository;

function reviewSla(array $hours = [
    'manager_review' => 24,
    'procurement_review' => 48,
]): PurchaseRequestReviewSla
{
    return new PurchaseRequestReviewSla(new Repository([
        'procurement' => [
            'review_sla_hours' => $hours,
        ],
    ]));
}

it('maps pending statuses to their approval stages', function (): void {
    $sla = reviewSla();

    expect($sla->stageFor(PurchaseRequestStatus::PendingManagerReview))
        ->toBe(ApprovalStage::ManagerReview)
        ->and($sla->stageFor(
            PurchaseRequestStatus::PendingProcurementReview,
        ))
        ->toBe(ApprovalStage::ProcurementReview)
        ->and($sla->stageFor(PurchaseRequestStatus::Approved))
        ->toBeNull();
});

it('calculates deadlines from the configured stage hours', function (): void {
    $sla = reviewSla();
    $enteredAt = CarbonImmutable::parse('2026-08-03 09:30:00');

    expect($sla->dueAtFor(
        PurchaseRequestStatus::PendingManagerReview,
        $enteredAt,
    )?->toDateTimeString())->toBe('2026-08-04 09:30:00')
        ->and($sla->dueAtFor(
            PurchaseRequestStatus::PendingProcurementReview,
            $enteredAt,
        )?->toDateTimeString())->toBe('2026-08-05 09:30:00')
        ->and($sla->dueAtFor(
            PurchaseRequestStatus::Completed,
            $enteredAt,
        ))->toBeNull();
});

it('treats a deadline as overdue at and after its timestamp', function (): void {
    $sla = reviewSla();
    $deadline = CarbonImmutable::parse('2026-08-04 09:30:00');

    expect($sla->isOverdue(
        $deadline,
        CarbonImmutable::parse('2026-08-04 09:29:59'),
    ))->toBeFalse()
        ->and($sla->isOverdue($deadline, $deadline))->toBeTrue()
        ->and($sla->isOverdue(
            null,
            CarbonImmutable::parse('2026-08-05 09:30:00'),
        ))->toBeFalse();
});

it('rejects invalid SLA configuration', function (): void {
    $sla = reviewSla([
        'manager_review' => 0,
        'procurement_review' => 48,
    ]);

    expect(fn () => $sla->dueAtFor(
        PurchaseRequestStatus::PendingManagerReview,
        CarbonImmutable::parse('2026-08-03 09:30:00'),
    ))->toThrow(LogicException::class);
});
