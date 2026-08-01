<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $purchase_request_id
 * @property int|null $actor_id
 * @property PurchaseRequestAction $action
 * @property PurchaseRequestStatus|null $from_status
 * @property PurchaseRequestStatus $to_status
 * @property array<string, mixed>|null $metadata
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read PurchaseRequest $purchaseRequest
 * @property-read User|null $actor
 */
#[Fillable([
    'purchase_request_id',
    'actor_id',
    'action',
    'from_status',
    'to_status',
    'metadata',
])]
final class ActivityLog extends Model
{
    /**
     * @return BelongsTo<PurchaseRequest, $this>
     */
    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'action' => PurchaseRequestAction::class,
            'from_status' => PurchaseRequestStatus::class,
            'to_status' => PurchaseRequestStatus::class,
            'metadata' => 'array',
        ];
    }
}
