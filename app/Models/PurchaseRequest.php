<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use Carbon\CarbonInterface;
use Database\Factories\PurchaseRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

/**
 * @property int $id
 * @property int $department_id
 * @property int $requester_id
 * @property string $reference
 * @property string $title
 * @property string $justification
 * @property CarbonInterface|null $needed_by
 * @property PurchaseRequestStatus $status
 * @property string $currency
 * @property string $total_amount
 * @property CarbonInterface|null $submitted_at
 * @property CarbonInterface|null $review_due_at
 * @property CarbonInterface|null $rejected_at
 * @property CarbonInterface|null $completed_at
 * @property CarbonInterface|null $cancelled_at
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Department $department
 * @property-read User $requester
 * @property-read Collection<int, PurchaseRequestItem> $items
 * @property-read Collection<int, Approval> $approvals
 * @property-read Collection<int, ApprovalReminder> $approvalReminders
 * @property-read Collection<int, ActivityLog> $activityLogs
 */
#[Fillable([
    'department_id',
    'requester_id',
    'reference',
    'title',
    'justification',
    'needed_by',
    'currency',
])]
final class PurchaseRequest extends Model
{
    /** @use HasFactory<PurchaseRequestFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * @return HasMany<PurchaseRequestItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseRequestItem::class)->orderBy('position');
    }

    /**
     * @return HasMany<Approval, $this>
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }

    /**
     * @return HasMany<ApprovalReminder, $this>
     */
    public function approvalReminders(): HasMany
    {
        return $this->hasMany(ApprovalReminder::class);
    }

    /**
     * @return HasMany<ActivityLog, $this>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class)->latest();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'needed_by' => 'immutable_date',
            'status' => PurchaseRequestStatus::class,
            'total_amount' => 'decimal:2',
            'submitted_at' => 'immutable_datetime',
            'review_due_at' => 'immutable_datetime',
            'rejected_at' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
        ];
    }
}
