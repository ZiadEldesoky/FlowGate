<?php

declare(strict_types=1);

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Exceptions\InvalidPurchaseRequestTransition;
use App\Domain\Procurement\Rules\PurchaseRequestWorkflow;

it('resolves every valid purchase request transition', function (
    PurchaseRequestStatus $from,
    PurchaseRequestAction $action,
    PurchaseRequestStatus $to,
): void {
    $workflow = new PurchaseRequestWorkflow;

    expect($workflow->allows($from, $action))->toBeTrue()
        ->and($workflow->transition($from, $action))->toBe($to);
})->with([
    'submit a draft' => [
        PurchaseRequestStatus::Draft,
        PurchaseRequestAction::Submit,
        PurchaseRequestStatus::PendingManagerReview,
    ],
    'manager approval' => [
        PurchaseRequestStatus::PendingManagerReview,
        PurchaseRequestAction::ApproveManagerReview,
        PurchaseRequestStatus::PendingProcurementReview,
    ],
    'procurement approval' => [
        PurchaseRequestStatus::PendingProcurementReview,
        PurchaseRequestAction::ApproveProcurementReview,
        PurchaseRequestStatus::Approved,
    ],
    'manager rejection' => [
        PurchaseRequestStatus::PendingManagerReview,
        PurchaseRequestAction::Reject,
        PurchaseRequestStatus::Rejected,
    ],
    'procurement rejection' => [
        PurchaseRequestStatus::PendingProcurementReview,
        PurchaseRequestAction::Reject,
        PurchaseRequestStatus::Rejected,
    ],
    'complete an approved request' => [
        PurchaseRequestStatus::Approved,
        PurchaseRequestAction::Complete,
        PurchaseRequestStatus::Completed,
    ],
    'cancel a draft' => [
        PurchaseRequestStatus::Draft,
        PurchaseRequestAction::Cancel,
        PurchaseRequestStatus::Cancelled,
    ],
    'cancel during manager review' => [
        PurchaseRequestStatus::PendingManagerReview,
        PurchaseRequestAction::Cancel,
        PurchaseRequestStatus::Cancelled,
    ],
    'cancel during procurement review' => [
        PurchaseRequestStatus::PendingProcurementReview,
        PurchaseRequestAction::Cancel,
        PurchaseRequestStatus::Cancelled,
    ],
]);

it('rejects transitions that are not in the workflow', function (): void {
    $workflow = new PurchaseRequestWorkflow;

    expect(fn (): PurchaseRequestStatus => $workflow->transition(
        PurchaseRequestStatus::Draft,
        PurchaseRequestAction::Complete,
    ))->toThrow(InvalidPurchaseRequestTransition::class);
});

it('derives approval stages from the review state', function (): void {
    $workflow = new PurchaseRequestWorkflow;

    expect($workflow->approvalStageFor(
        PurchaseRequestStatus::PendingManagerReview,
        PurchaseRequestAction::Reject,
    ))->toBe(ApprovalStage::ManagerReview)
        ->and($workflow->approvalStageFor(
            PurchaseRequestStatus::PendingProcurementReview,
            PurchaseRequestAction::ApproveProcurementReview,
        ))->toBe(ApprovalStage::ProcurementReview);
});

it('keeps terminal states terminal', function (
    PurchaseRequestStatus $status,
): void {
    $workflow = new PurchaseRequestWorkflow;

    expect($workflow->allowedActions($status))->toBe([]);
})->with([
    PurchaseRequestStatus::Rejected,
    PurchaseRequestStatus::Completed,
    PurchaseRequestStatus::Cancelled,
]);
