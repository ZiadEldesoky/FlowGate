<?php

declare(strict_types=1);

namespace App\Domain\Procurement\Actions;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Queries\ProcurementReportQuery;
use App\Models\User;
use RuntimeException;

final readonly class ExportProcurementReport
{
    public function __construct(
        private ProcurementReportQuery $report,
    ) {}

    /**
     * @param  array{
     *     from: string,
     *     to: string,
     *     status: PurchaseRequestStatus|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     */
    public function write(User $user, array $filters): void
    {
        $output = fopen('php://output', 'wb');

        if ($output === false) {
            throw new RuntimeException('Unable to open the CSV output stream.');
        }

        try {
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv(
                $output,
                [
                    'Reference',
                    'Title',
                    'Requester',
                    'Department',
                    'Department code',
                    'Status',
                    'Total amount',
                    'Currency',
                    'Created at',
                    'Submitted at',
                    'Needed by',
                ],
                ',',
                '"',
                '',
            );

            foreach ($this->report->exportRows($user, $filters) as $request) {
                fputcsv(
                    $output,
                    [
                        $request->reference,
                        $this->csvCell($request->title),
                        $this->csvCell($request->requester->name),
                        $this->csvCell($request->department->name),
                        $this->csvCell($request->department->code),
                        $request->status->value,
                        $request->total_amount,
                        $request->currency,
                        $request->created_at?->toAtomString() ?? '',
                        $request->submitted_at?->toAtomString() ?? '',
                        $request->needed_by?->toDateString() ?? '',
                    ],
                    ',',
                    '"',
                    '',
                );
            }
        } finally {
            fclose($output);
        }
    }

    /**
     * @param  array{
     *     from: string,
     *     to: string,
     *     status: PurchaseRequestStatus|null,
     *     department_id: int|null,
     *     page: int
     * }  $filters
     */
    public function filename(array $filters): string
    {
        return sprintf(
            'procurement-report-%s-to-%s.csv',
            $filters['from'],
            $filters['to'],
        );
    }

    private function csvCell(string $value): string
    {
        return preg_match('/^[=+\-@\t\r]/u', $value) === 1
            ? "'{$value}"
            : $value;
    }
}
