<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Procurement\Enums\ApprovalDecision;
use App\Domain\Procurement\Enums\ApprovalStage;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $purchase_request_id
 * @property int $actor_id
 * @property ApprovalStage $stage
 * @property ApprovalDecision $decision
 * @property string|null $comment
 * @property CarbonInterface $decided_at
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read PurchaseRequest $purchaseRequest
 * @property-read User $actor
 */
#[Fillable([
    'purchase_request_id',
    'actor_id',
    'stage',
    'decision',
    'comment',
    'decided_at',
])]
final class Approval extends Model
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
            'stage' => ApprovalStage::class,
            'decision' => ApprovalDecision::class,
            'decided_at' => 'immutable_datetime',
        ];
    }
}
