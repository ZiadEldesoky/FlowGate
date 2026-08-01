<?php

declare(strict_types=1);

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

arch('application code uses strict types')
    ->expect('App')
    ->toUseStrictTypes();

arch('domain code is independent from the HTTP layer')
    ->expect('App\Domain')
    ->not->toUse([
        'App\Http',
        'Illuminate\Http',
    ]);

arch('controllers do not query models or manage transactions directly')
    ->expect('App\Http\Controllers')
    ->not->toUse([
        'App\Models',
        DB::class,
    ]);

arch('domain actions do not perform authorization')
    ->expect('App\Domain\Procurement\Actions')
    ->not->toUse([
        AuthorizesRequests::class,
        Gate::class,
    ]);

arch('policies remain the authorization boundary')
    ->expect('App\Policies')
    ->classes()
    ->toHaveSuffix('Policy');

arch('generic repository layers are forbidden')
    ->expect('App')
    ->not->toHaveSuffix('Repository');

arch('generic service layers are forbidden')
    ->expect('App')
    ->not->toHaveSuffix('Service');

arch('controllers follow Laravel naming')
    ->expect('App\Http\Controllers')
    ->classes()
    ->toHaveSuffix('Controller');
