<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Rules;

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Config\Repository;
use LogicException;

final readonly class PurchaseRequestReviewSla
{
    public function __construct(
        private Repository $config,
    ) {}

    public function dueAtFor(
        PurchaseRequestStatus $status,
        CarbonInterface $enteredAt,
    ): ?CarbonImmutable {
        $stage = $this->stageFor($status);

        if ($stage === null) {
            return null;
        }

        $hours = $this->config->get(
            "procurement.review_sla_hours.{$stage->value}",
        );

        if (! is_int($hours) || $hours < 1) {
            throw new LogicException(sprintf(
                'Review SLA for stage [%s] must be a positive integer.',
                $stage->value,
            ));
        }

        return CarbonImmutable::instance($enteredAt)->addHours($hours);
    }

    public function stageFor(
        PurchaseRequestStatus $status,
    ): ?ApprovalStage {
        return match ($status) {
            PurchaseRequestStatus::PendingManagerReview => ApprovalStage::ManagerReview,
            PurchaseRequestStatus::PendingProcurementReview => ApprovalStage::ProcurementReview,
            default => null,
        };
    }

    public function isOverdue(
        ?CarbonInterface $reviewDueAt,
        CarbonInterface $asOf,
    ): bool {
        return $reviewDueAt !== null && $reviewDueAt->lessThanOrEqualTo($asOf);
    }
}
