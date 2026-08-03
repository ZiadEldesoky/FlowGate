<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Actions;

use App\Domain\Procurement\Enums\ApprovalDecision;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Events\PurchaseRequestTransitioned;
use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use App\Domain\Procurement\Rules\PurchaseRequestWorkflow;
use App\Models\PurchaseRequest;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use LogicException;

final readonly class TransitionPurchaseRequest
{
    public function __construct(
        private PurchaseRequestWorkflow $workflow,
        private PurchaseRequestReviewSla $reviewSla,
    ) {}

    public function handle(
        PurchaseRequest $purchaseRequest,
        User $actor,
        PurchaseRequestAction $action,
        ?ApprovalDecision $decision = null,
        ?string $comment = null,
    ): PurchaseRequest {
        $this->assertDecisionMatchesAction($action, $decision);

        return DB::transaction(function () use (
            $purchaseRequest,
            $actor,
            $action,
            $decision,
            $comment,
        ): PurchaseRequest {
            $lockedRequest = PurchaseRequest::query()
                ->lockForUpdate()
                ->findOrFail($purchaseRequest->id);

            $fromStatus = $lockedRequest->status;
            $toStatus = $this->workflow->transition($fromStatus, $action);
            $normalizedComment = $this->normalizeComment($comment);
            $transitionedAt = now();

            if ($decision !== null) {
                $lockedRequest->approvals()->create([
                    'actor_id' => $actor->id,
                    'stage' => $this->workflow->approvalStageFor($fromStatus, $action),
                    'decision' => $decision,
                    'comment' => $normalizedComment,
                    'decided_at' => $transitionedAt,
                ]);
            }

            $lockedRequest->status = $toStatus;
            $lockedRequest->review_due_at = $this->reviewSla->dueAtFor(
                $toStatus,
                $transitionedAt,
            );
            $this->applyTransitionTimestamp(
                $lockedRequest,
                $action,
                $transitionedAt,
            );
            $lockedRequest->save();

            $lockedRequest->activityLogs()->create([
                'actor_id' => $actor->id,
                'action' => $action,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'metadata' => $decision === null && $normalizedComment !== null
                    ? ['comment' => $normalizedComment]
                    : null,
            ]);

            event(new PurchaseRequestTransitioned(
                purchaseRequestId: $lockedRequest->id,
                actorId: $actor->id,
                action: $action,
                fromStatus: $fromStatus,
                toStatus: $toStatus,
            ));

            return $lockedRequest->refresh();
        }, 3);
    }

    private function applyTransitionTimestamp(
        PurchaseRequest $purchaseRequest,
        PurchaseRequestAction $action,
        CarbonInterface $transitionedAt,
    ): void {
        match ($action) {
            PurchaseRequestAction::Submit => $purchaseRequest->submitted_at = $transitionedAt,
            PurchaseRequestAction::Reject => $purchaseRequest->rejected_at = $transitionedAt,
            PurchaseRequestAction::Complete => $purchaseRequest->completed_at = $transitionedAt,
            PurchaseRequestAction::Cancel => $purchaseRequest->cancelled_at = $transitionedAt,
            PurchaseRequestAction::ApproveManagerReview,
            PurchaseRequestAction::ApproveProcurementReview => null,
        };
    }

    private function assertDecisionMatchesAction(
        PurchaseRequestAction $action,
        ?ApprovalDecision $decision,
    ): void {
        $recordsApproval = in_array($action, [
            PurchaseRequestAction::ApproveManagerReview,
            PurchaseRequestAction::ApproveProcurementReview,
            PurchaseRequestAction::Reject,
        ], true);

        if ($recordsApproval !== ($decision !== null)) {
            throw new LogicException(sprintf(
                'Action [%s] was called with an invalid approval decision.',
                $action->value,
            ));
        }
    }

    private function normalizeComment(?string $comment): ?string
    {
        if ($comment === null) {
            return null;
        }

        $comment = trim($comment);

        return $comment === '' ? null : $comment;
    }
}
