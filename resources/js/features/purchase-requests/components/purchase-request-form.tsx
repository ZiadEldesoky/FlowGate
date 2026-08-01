import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ItemRowsEditor } from '@/features/purchase-requests/components/item-rows-editor';
import type { PurchaseRequestCopy } from '@/features/purchase-requests/i18n';
import { purchaseRequestRoutes } from '@/features/purchase-requests/routes';
import {
    estimateItemsTotal,
    formatEstimate,
    toDateInputValue,
} from '@/features/purchase-requests/utils';
import type { AppLocale } from '@/types/locale';
import type {
    PurchaseRequestDepartment,
    PurchaseRequestFormErrorKey,
    PurchaseRequestFormPayload,
} from '@/types/purchase-request';

type PurchaseRequestFormProps = {
    mode: 'create' | 'edit';
    locale: AppLocale;
    labels: PurchaseRequestCopy;
    department?: PurchaseRequestDepartment | null;
    data: PurchaseRequestFormPayload;
    setData: {
        <K extends keyof PurchaseRequestFormPayload>(
            key: K,
            value: PurchaseRequestFormPayload[K],
        ): void;
    };
    clearError: (field: PurchaseRequestFormErrorKey) => void;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    cancelHref?: string;
};

export function PurchaseRequestForm({
    mode,
    locale,
    labels,
    department,
    data,
    setData,
    clearError,
    errors,
    processing,
    onSubmit,
    cancelHref = purchaseRequestRoutes.indexUrl(),
}: PurchaseRequestFormProps) {
    const estimatedTotal = useMemo(
        () => estimateItemsTotal(data.items),
        [data.items],
    );
    const estimatedTotalLabel = formatEstimate(
        estimatedTotal,
        data.currency,
        locale,
    );
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {hasErrors ? (
                <Alert variant="destructive">
                    <AlertTitle>{labels.validationTitle}</AlertTitle>
                    <AlertDescription>
                        {labels.validationSummary}
                    </AlertDescription>
                </Alert>
            ) : null}

            <section className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-2">
                <FormField
                    id="title"
                    label={labels.title}
                    required
                    error={errors.title}
                    className="md:col-span-2"
                >
                    <Input
                        value={data.title}
                        onChange={(event) => {
                            setData('title', event.target.value);
                            clearError('title');
                        }}
                        disabled={processing}
                        autoComplete="off"
                    />
                </FormField>

                <FormField
                    id="justification"
                    label={labels.justification}
                    required
                    error={errors.justification}
                    className="md:col-span-2"
                >
                    <Textarea
                        value={data.justification}
                        onChange={(event) => {
                            setData('justification', event.target.value);
                            clearError('justification');
                        }}
                        disabled={processing}
                        rows={4}
                    />
                </FormField>

                <FormField
                    id="needed_by"
                    label={labels.neededBy}
                    error={errors.needed_by}
                >
                    <Input
                        type="date"
                        value={toDateInputValue(data.needed_by)}
                        onChange={(event) => {
                            setData(
                                'needed_by',
                                event.target.value.length > 0
                                    ? event.target.value
                                    : null,
                            );
                            clearError('needed_by');
                        }}
                        disabled={processing}
                    />
                </FormField>

                <FormField id="currency" label={labels.currency}>
                    <Input value={data.currency} disabled readOnly />
                </FormField>

                {department ? (
                    <div className="grid gap-1 md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground">
                            {labels.department}
                        </p>
                        <p className="text-sm text-foreground">
                            {department.name}
                            <span className="ms-2 text-muted-foreground">
                                ({department.code})
                            </span>
                        </p>
                    </div>
                ) : null}
            </section>

            <section className="rounded-md border bg-card p-4">
                <ItemRowsEditor
                    items={data.items}
                    labels={labels}
                    errors={errors}
                    disabled={processing}
                    onChange={(items) => setData('items', items)}
                    onClearError={clearError}
                />
            </section>

            <section className="rounded-md border border-dashed bg-muted/20 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            {labels.estimatedTotal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {labels.estimatedTotalNote}
                        </p>
                    </div>
                    <p className="font-mono text-sm font-semibold tabular-nums">
                        {estimatedTotalLabel}
                    </p>
                </div>
            </section>

            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                    asChild
                    type="button"
                    variant="outline"
                    disabled={processing}
                >
                    <Link href={cancelHref}>{labels.cancel}</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? <Spinner /> : null}
                    {processing
                        ? labels.processing
                        : mode === 'create'
                          ? labels.saveDraft
                          : labels.updateDraft}
                </Button>
            </div>
        </form>
    );
}
