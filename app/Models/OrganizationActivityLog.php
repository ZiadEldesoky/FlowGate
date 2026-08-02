<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Organization\Enums\OrganizationActivityAction;
use App\Domain\Organization\Enums\OrganizationSubjectType;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $actor_id
 * @property OrganizationActivityAction $action
 * @property OrganizationSubjectType $subject_type
 * @property int $subject_id
 * @property string $subject_label
 * @property list<array{field: string, from: string|null, to: string|null}> $changes
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read User $actor
 */
#[Fillable([
    'actor_id',
    'action',
    'subject_type',
    'subject_id',
    'subject_label',
    'changes',
])]
final class OrganizationActivityLog extends Model
{
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
            'action' => OrganizationActivityAction::class,
            'subject_type' => OrganizationSubjectType::class,
            'changes' => 'array',
        ];
    }
}
