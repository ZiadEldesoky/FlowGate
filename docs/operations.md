# Operations

FlowGate is one Laravel application backed by one relational database. It needs
an HTTP process, one queue worker, and Laravel's scheduler. The repository does
not prescribe a cloud vendor or introduce containers before a real deployment
requires them.

## Local processes

After `composer setup`, the project development command starts the Laravel
server, database queue listener, log stream, Vite, and scheduler together:

```bash
composer dev
```

The scheduler evaluates approval deadlines hourly and dispatches queued work.
For focused troubleshooting, run the processes separately:

```bash
php artisan serve
npm run dev
php artisan queue:work --tries=3 --timeout=60
php artisan schedule:work
```

The reminder discovery command can also be invoked directly:

```bash
php artisan procurement:dispatch-overdue-review-reminders
```

Running it repeatedly is safe. Before sending, each job locks and rechecks the
request, and the database permits only one processed reminder per request,
review stage, and calendar day.

## Approval SLA

The default deadlines are configured in `config/procurement.php`:

| Review stage | Deadline |
| --- | --- |
| Manager review | 24 hours after submission |
| Procurement review | 48 hours after manager approval |

The deadline is written atomically with the workflow transition and cleared
when the request leaves review. React receives `reviewDueAt` and `isOverdue` as
server-owned presentation data; it does not calculate workflow state from the
browser clock.

## Production process contract

Use PHP 8.3 or newer, a supported Node.js 22 build environment, and MySQL 8.4.
Keep application secrets in the runtime environment and set `APP_DEBUG=false`.

A typical immutable release runs:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
npm ci
npm run build
php artisan optimize:clear
php artisan migrate --force
php artisan optimize
php artisan queue:restart
```

Run one supervised queue worker:

```bash
php artisan queue:work --sleep=3 --tries=3 --timeout=60
```

Run Laravel's scheduler from one host:

```cron
* * * * cd /var/www/flowgate && php artisan schedule:run >> /dev/null 2>&1
```

When deploying multiple application hosts, keep a single scheduler leader or
use an atomic shared cache compatible with Laravel's overlap locks.

## Health and recovery

- `GET /up` verifies that Laravel can boot and serve requests.
- `php artisan schedule:list` confirms the reminder schedule.
- `php artisan queue:failed` lists exhausted jobs.
- `php artisan queue:retry <id>` retries a reviewed failure.
- `php artisan queue:restart` asks long-running workers to reload released code.

Prefer a release-directory or equivalent rollback strategy. Rolling application
code back is safe only while the deployed migrations remain backward
compatible; production rollback must not automatically run migration `down`
methods.

GitHub Actions runs the full quality suite on SQLite and the Pest suite against
MySQL 8.4, including a clean migration, before a change is accepted.
