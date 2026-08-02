<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Rules\PurchaseRequestWorkflow;
use App\Models\PurchaseRequest;
use App\Models\User;

final readonly class PurchaseRequestPolicy
{
    public function __construct(
        private PurchaseRequestWorkflow $workflow,
    ) {}

    public function viewAny(User $user): bool
    {
        return in_array($user->role, UserRole::cases(), true);
    }

    public function view(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $this->isAdministrator($user)
            || $this->isProcurement($user)
            || $purchaseRequest->requester_id === $user->id
            || $this->managesDepartment($user, $purchaseRequest);
    }

    public function create(User $user): bool
    {
        return $user->department_id !== null;
    }

    public function viewApprovalQueue(User $user): bool
    {
        return $this->viewManagerApprovalQueue($user)
            || $this->viewProcurementApprovalQueue($user);
    }

    public function viewManagerApprovalQueue(User $user): bool
    {
        return $user->role === UserRole::Manager
            && $user->managedDepartments()->exists();
    }

    public function viewProcurementApprovalQueue(User $user): bool
    {
        return $this->isProcurement($user) || $this->isAdministrator($user);
    }

    public function update(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $purchaseRequest->requester_id === $user->id
            && $purchaseRequest->status === PurchaseRequestStatus::Draft;
    }

    public function submit(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $purchaseRequest->requester_id === $user->id
            && $this->workflow->allows(
                $purchaseRequest->status,
                PurchaseRequestAction::Submit,
            );
    }

    public function approveManagerReview(
        User $user,
        PurchaseRequest $purchaseRequest,
    ): bool {
        return $this->managesDepartment($user, $purchaseRequest)
            && $this->workflow->allows(
                $purchaseRequest->status,
                PurchaseRequestAction::ApproveManagerReview,
            );
    }

    public function approveProcurementReview(
        User $user,
        PurchaseRequest $purchaseRequest,
    ): bool {
        return ($this->isProcurement($user) || $this->isAdministrator($user))
            && $this->workflow->allows(
                $purchaseRequest->status,
                PurchaseRequestAction::ApproveProcurementReview,
            );
    }

    public function reject(User $user, PurchaseRequest $purchaseRequest): bool
    {
        if (! $this->workflow->allows(
            $purchaseRequest->status,
            PurchaseRequestAction::Reject,
        )) {
            return false;
        }

        return match ($this->workflow->approvalStageFor(
            $purchaseRequest->status,
            PurchaseRequestAction::Reject,
        )) {
            ApprovalStage::ManagerReview => $this->managesDepartment(
                $user,
                $purchaseRequest,
            ),
            ApprovalStage::ProcurementReview => $this->isProcurement($user)
                || $this->isAdministrator($user),
        };
    }

    public function complete(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return ($this->isProcurement($user) || $this->isAdministrator($user))
            && $this->workflow->allows(
                $purchaseRequest->status,
                PurchaseRequestAction::Complete,
            );
    }

    public function cancel(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $purchaseRequest->requester_id === $user->id
            && $this->workflow->allows(
                $purchaseRequest->status,
                PurchaseRequestAction::Cancel,
            );
    }

    public function delete(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return false;
    }

    private function isAdministrator(User $user): bool
    {
        return $user->role === UserRole::Administrator;
    }

    private function isProcurement(User $user): bool
    {
        return $user->role === UserRole::Procurement;
    }

    private function managesDepartment(
        User $user,
        PurchaseRequest $purchaseRequest,
    ): bool {
        return $user->role === UserRole::Manager
            && $purchaseRequest->department()
                ->where('manager_id', $user->id)
                ->exists();
    }
}
