<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Organization\Actions\MarkNotificationAsRead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class NotificationReadController extends Controller
{
    public function __invoke(
        Request $request,
        string $notificationId,
        MarkNotificationAsRead $action,
    ): RedirectResponse {
        $action->handle($request->user(), $notificationId);

        return back();
    }
}
