<?php

declare(strict_types=1);

namespace App\Domain\Organization\Actions;

use App\Domain\Organization\Enums\OrganizationActivityAction;
use App\Domain\Organization\Enums\OrganizationSubjectType;
use App\Models\OrganizationActivityLog;
use App\Models\User;
use InvalidArgumentException;

final class RecordOrganizationActivity
{
    /**
     * @param  list<array{field: string, from: string|null, to: string|null}>  $changes
     */
    public function handle(
        User $actor,
        OrganizationActivityAction $action,
        OrganizationSubjectType $subjectType,
        int $subjectId,
        string $subjectLabel,
        array $changes,
    ): OrganizationActivityLog {
        if ($changes === []) {
            throw new InvalidArgumentException(
                'Organization activity requires at least one change.',
            );
        }

        return OrganizationActivityLog::query()->create([
            'actor_id' => $actor->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'subject_label' => $subjectLabel,
            'changes' => $changes,
        ]);
    }
}
