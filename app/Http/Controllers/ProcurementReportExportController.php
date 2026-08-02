<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\ExportProcurementReport;
use App\Http\Requests\Procurement\ProcurementReportRequest;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ProcurementReportExportController extends Controller
{
    public function __invoke(
        ProcurementReportRequest $request,
        ExportProcurementReport $export,
    ): StreamedResponse {
        $user = $request->actor();
        $filters = $request->filters();

        return response()->streamDownload(
            static fn () => $export->write($user, $filters),
            $export->filename($filters),
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }
}
