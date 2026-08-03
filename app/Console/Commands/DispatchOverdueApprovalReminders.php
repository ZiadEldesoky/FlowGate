<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Queries\OverduePurchaseRequestReviewsQuery;
use App\Jobs\SendOverdueApprovalReminder;
use Illuminate\Console\Command;

final class DispatchOverdueApprovalReminders extends Command
{
    protected $signature = 'procurement:dispatch-overdue-review-reminders';

    protected $description = 'Dispatch queued reminders for overdue approval reviews';

    public function handle(
        OverduePurchaseRequestReviewsQuery $overdueReviews,
    ): int {
        $asOf = now();
        $reminderOn = $asOf->toDateString();
        $dispatched = $overdueReviews->eachDueAt(
            $asOf,
            $reminderOn,
            static function (
                int $purchaseRequestId,
                ApprovalStage $stage,
            ) use (
                $reminderOn,
            ): void {
                SendOverdueApprovalReminder::dispatch(
                    $purchaseRequestId,
                    $stage,
                    $reminderOn,
                );
            },
        );

        $this->info(sprintf(
            'Dispatched %d overdue approval reminder job(s).',
            $dispatched,
        ));

        return self::SUCCESS;
    }
}
