<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Procurement\Enums\ApprovalStage;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $purchase_request_id
 * @property ApprovalStage $stage
 * @property string $reminder_on
 * @property int $recipient_count
 * @property CarbonInterface|null $processed_at
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read PurchaseRequest $purchaseRequest
 */
#[Fillable([
    'purchase_request_id',
    'stage',
    'reminder_on',
])]
final class ApprovalReminder extends Model
{
    /**
     * @return BelongsTo<PurchaseRequest, $this>
     */
    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stage' => ApprovalStage::class,
            'recipient_count' => 'integer',
            'processed_at' => 'immutable_datetime',
        ];
    }
}
