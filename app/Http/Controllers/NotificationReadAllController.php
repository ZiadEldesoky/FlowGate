<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Organization\Actions\MarkAllNotificationsAsRead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class NotificationReadAllController extends Controller
{
    public function __invoke(
        Request $request,
        MarkAllNotificationsAsRead $action,
    ): RedirectResponse {
        $action->handle($request->user());

        return back();
    }
}
