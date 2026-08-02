<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Organization\Queries\UserNotificationsIndexQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class NotificationController extends Controller
{
    public function __invoke(
        Request $request,
        UserNotificationsIndexQuery $query,
    ): Response {
        return Inertia::render(
            'notifications/index',
            $query->for($request->user()),
        );
    }
}
