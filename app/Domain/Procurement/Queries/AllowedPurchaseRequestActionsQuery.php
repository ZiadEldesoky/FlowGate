<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Rules\PurchaseRequestWorkflow;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\Access\Gate;

final readonly class AllowedPurchaseRequestActionsQuery
{
    /**
     * @var array<string, string>
     */
    private const array POLICY_ABILITIES = [
        'submit' => 'submit',
        'approve_manager_review' => 'approveManagerReview',
        'approve_procurement_review' => 'approveProcurementReview',
        'reject' => 'reject',
        'complete' => 'complete',
        'cancel' => 'cancel',
    ];

    public function __construct(
        private PurchaseRequestWorkflow $workflow,
        private Gate $gate,
    ) {}

    /**
     * @return list<PurchaseRequestAction>
     */
    public function for(
        User $user,
        PurchaseRequest $purchaseRequest,
    ): array {
        $gate = $this->gate->forUser($user);

        return array_values(array_filter(
            $this->workflow->allowedActions($purchaseRequest->status),
            fn (PurchaseRequestAction $action): bool => $gate->allows(
                self::POLICY_ABILITIES[$action->value],
                $purchaseRequest,
            ),
        ));
    }
}
