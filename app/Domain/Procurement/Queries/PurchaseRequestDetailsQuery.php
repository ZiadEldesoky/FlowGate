<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Rules\PurchaseRequestReviewSla;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\Access\Gate;

final readonly class PurchaseRequestDetailsQuery
{
    public function __construct(
        private AllowedPurchaseRequestActionsQuery $allowedActions,
        private PurchaseRequestReviewSla $reviewSla,
        private Gate $gate,
    ) {}

    /**
     * @return array{
     *     purchaseRequest: array{
     *         id: int,
     *         reference: string,
     *         title: string,
     *         justification: string,
     *         neededBy: string|null,
     *         status: string,
     *         currency: string,
     *         totalAmount: string,
     *         submittedAt: string|null,
     *         reviewDueAt: string|null,
     *         isOverdue: bool,
     *         createdAt: string,
     *         requester: array{id: int, name: string, email: string},
     *         department: array{id: int, name: string, code: string},
     *         items: list<array{
     *             id: int,
     *             description: string,
     *             sku: string|null,
     *             quantity: string,
     *             unitPrice: string,
     *             lineTotal: string,
     *             position: int
     *         }>,
     *         approvals: list<array{
     *             id: int,
     *             stage: string,
     *             decision: string,
     *             comment: string|null,
     *             decidedAt: string,
     *             actor: array{id: int, name: string}
     *         }>,
     *         activity: list<array{
     *             id: int,
     *             action: string,
     *             fromStatus: string|null,
     *             toStatus: string,
     *             comment: string|null,
     *             createdAt: string,
     *             actor: array{id: int, name: string}|null
     *         }>
     *     },
     *     allowedActions: list<string>,
     *     can: array{update: bool}
     * }
     */
    public function for(
        User $user,
        PurchaseRequest $purchaseRequest,
    ): array {
        $purchaseRequest->load([
            'requester:id,name,email',
            'department:id,name,code',
            'items',
            'approvals.actor:id,name',
            'activityLogs.actor:id,name',
        ]);

        $items = [];
        $approvals = [];
        $activity = [];

        foreach ($purchaseRequest->items as $item) {
            $items[] = [
                'id' => $item->id,
                'description' => $item->description,
                'sku' => $item->sku,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price,
                'lineTotal' => $item->line_total,
                'position' => $item->position,
            ];
        }

        foreach ($purchaseRequest->approvals as $approval) {
            $approvals[] = [
                'id' => $approval->id,
                'stage' => $approval->stage->value,
                'decision' => $approval->decision->value,
                'comment' => $approval->comment,
                'decidedAt' => $approval->decided_at->toAtomString(),
                'actor' => [
                    'id' => $approval->actor->id,
                    'name' => $approval->actor->name,
                ],
            ];
        }

        foreach ($purchaseRequest->activityLogs as $log) {
            $activity[] = [
                'id' => $log->id,
                'action' => $log->action->value,
                'fromStatus' => $log->from_status?->value,
                'toStatus' => $log->to_status->value,
                'comment' => is_string($log->metadata['comment'] ?? null)
                    ? $log->metadata['comment']
                    : null,
                'createdAt' => $log->created_at?->toAtomString() ?? '',
                'actor' => $log->actor === null
                    ? null
                    : [
                        'id' => $log->actor->id,
                        'name' => $log->actor->name,
                    ],
            ];
        }

        return [
            'purchaseRequest' => [
                'id' => $purchaseRequest->id,
                'reference' => $purchaseRequest->reference,
                'title' => $purchaseRequest->title,
                'justification' => $purchaseRequest->justification,
                'neededBy' => $purchaseRequest->needed_by?->toDateString(),
                'status' => $purchaseRequest->status->value,
                'currency' => $purchaseRequest->currency,
                'totalAmount' => $purchaseRequest->total_amount,
                'submittedAt' => $purchaseRequest->submitted_at?->toAtomString(),
                'reviewDueAt' => $purchaseRequest->review_due_at?->toAtomString(),
                'isOverdue' => $this->reviewSla->isOverdue(
                    $purchaseRequest->review_due_at,
                    now(),
                ),
                'createdAt' => $purchaseRequest->created_at?->toAtomString() ?? '',
                'requester' => [
                    'id' => $purchaseRequest->requester->id,
                    'name' => $purchaseRequest->requester->name,
                    'email' => $purchaseRequest->requester->email,
                ],
                'department' => [
                    'id' => $purchaseRequest->department->id,
                    'name' => $purchaseRequest->department->name,
                    'code' => $purchaseRequest->department->code,
                ],
                'items' => $items,
                'approvals' => $approvals,
                'activity' => $activity,
            ],
            'allowedActions' => array_map(
                static fn (PurchaseRequestAction $action): string => $action->value,
                $this->allowedActions->for($user, $purchaseRequest),
            ),
            'can' => [
                'update' => $this->gate
                    ->forUser($user)
                    ->allows('update', $purchaseRequest),
            ],
        ];
    }
}
