<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Queries;

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestScope;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

final class VisiblePurchaseRequestsQuery
{
    /**
     * @return Builder<PurchaseRequest>
     */
    public function for(User $user): Builder
    {
        $query = PurchaseRequest::query();

        return match ($user->role) {
            UserRole::Requester => $query->where(
                'requester_id',
                $user->id,
            ),
            UserRole::Manager => $query->whereHas(
                'department',
                fn (Builder $department): Builder => $department->where(
                    'manager_id',
                    $user->id,
                ),
            ),
            UserRole::Procurement,
            UserRole::Administrator => $query,
        };
    }

    public function scopeFor(User $user): PurchaseRequestScope
    {
        return match ($user->role) {
            UserRole::Requester => PurchaseRequestScope::OwnRequests,
            UserRole::Manager => PurchaseRequestScope::ManagedDepartments,
            UserRole::Procurement,
            UserRole::Administrator => PurchaseRequestScope::AllRequests,
        };
    }
}
