<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Rules;

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Exceptions\InvalidPurchaseRequestTransition;

final class PurchaseRequestWorkflow
{
    /**
     * @var array<string, array<string, string>>
     */
    private const array TRANSITIONS = [
        'draft' => [
            'submit' => 'pending_manager_review',
            'cancel' => 'cancelled',
        ],
        'pending_manager_review' => [
            'approve_manager_review' => 'pending_procurement_review',
            'reject' => 'rejected',
            'cancel' => 'cancelled',
        ],
        'pending_procurement_review' => [
            'approve_procurement_review' => 'approved',
            'reject' => 'rejected',
            'cancel' => 'cancelled',
        ],
        'approved' => [
            'complete' => 'completed',
        ],
        'rejected' => [],
        'completed' => [],
        'cancelled' => [],
    ];

    public function allows(
        PurchaseRequestStatus $status,
        PurchaseRequestAction $action,
    ): bool {
        return isset(self::TRANSITIONS[$status->value][$action->value]);
    }

    public function transition(
        PurchaseRequestStatus $status,
        PurchaseRequestAction $action,
    ): PurchaseRequestStatus {
        $target = self::TRANSITIONS[$status->value][$action->value] ?? null;

        if ($target === null) {
            throw InvalidPurchaseRequestTransition::for($status, $action);
        }

        return PurchaseRequestStatus::from($target);
    }

    /**
     * @return list<PurchaseRequestAction>
     */
    public function allowedActions(PurchaseRequestStatus $status): array
    {
        return array_map(
            PurchaseRequestAction::from(...),
            array_keys(self::TRANSITIONS[$status->value]),
        );
    }

    public function approvalStageFor(
        PurchaseRequestStatus $status,
        PurchaseRequestAction $action,
    ): ApprovalStage {
        if (! $this->allows($status, $action)) {
            throw InvalidPurchaseRequestTransition::for($status, $action);
        }

        return match ($status) {
            PurchaseRequestStatus::PendingManagerReview => ApprovalStage::ManagerReview,
            PurchaseRequestStatus::PendingProcurementReview => ApprovalStage::ProcurementReview,
            default => throw InvalidPurchaseRequestTransition::for($status, $action),
        };
    }
}
