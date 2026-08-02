import { useForm } from '@inertiajs/react';
import { CheckCircle2, Ban } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { getPurchaseRequestCopy } from '@/features/purchase-requests/i18n';
import { purchaseRequestRoutes } from '@/features/purchase-requests/routes';
import type { AppLocale } from '@/types/locale';

type LifecycleDialogsProps = {
    purchaseRequestId: number;
    allowedActions: string[];
    locale: AppLocale;
};

export function LifecycleDialogs({
    purchaseRequestId,
    allowedActions,
    locale,
}: LifecycleDialogsProps) {
    const t = getPurchaseRequestCopy(locale);
    const canComplete = allowedActions.includes('complete');
    const canCancel = allowedActions.includes('cancel');
    const [completeOpen, setCompleteOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const completeForm = useForm({});
    const cancelForm = useForm<{ comment: string }>({
        comment: '',
    });

    if (!canComplete && !canCancel) {
        return null;
    }

    const completeRequest = (): void => {
        completeForm.post(
            purchaseRequestRoutes.completeUrl(purchaseRequestId),
            {
                preserveScroll: true,
                onSuccess: () => setCompleteOpen(false),
            },
        );
    };

    const cancelRequest = (): void => {
        cancelForm.post(purchaseRequestRoutes.cancelUrl(purchaseRequestId), {
            preserveScroll: true,
            onSuccess: () => {
                setCancelOpen(false);
                cancelForm.reset('comment');
                cancelForm.clearErrors();
            },
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {canComplete ? (
                <Dialog
                    open={completeOpen}
                    onOpenChange={(open) => {
                        if (!completeForm.processing) {
                            setCompleteOpen(open);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button type="button" size="sm">
                            <CheckCircle2 className="size-4" />
                            {t.completeRequest}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t.completeRequestTitle}</DialogTitle>
                            <DialogDescription>
                                {t.completeRequestDescription}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={completeForm.processing}
                                >
                                    {t.cancel}
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={completeRequest}
                                disabled={completeForm.processing}
                            >
                                {completeForm.processing ? (
                                    <Spinner />
                                ) : (
                                    <CheckCircle2 className="size-4" />
                                )}
                                {completeForm.processing
                                    ? t.processing
                                    : t.confirmCompleteAction}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}

            {canCancel ? (
                <Dialog
                    open={cancelOpen}
                    onOpenChange={(open) => {
                        if (cancelForm.processing) {
                            return;
                        }

                        setCancelOpen(open);

                        if (!open) {
                            cancelForm.clearErrors();
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button type="button" size="sm" variant="destructive">
                            <Ban className="size-4" />
                            {t.cancelRequest}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t.cancelRequestTitle}</DialogTitle>
                            <DialogDescription>
                                {t.cancelRequestDescription}
                            </DialogDescription>
                        </DialogHeader>

                        {Object.keys(cancelForm.errors).length > 0 ? (
                            <Alert variant="destructive">
                                <AlertTitle>
                                    {t.lifecycleValidationSummary}
                                </AlertTitle>
                                <AlertDescription>
                                    {cancelForm.errors.comment ??
                                        t.lifecycleValidationSummary}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid gap-2">
                            <Label htmlFor="cancellation-comment">
                                {t.cancellationReasonOptional}
                            </Label>
                            <Textarea
                                id="cancellation-comment"
                                value={cancelForm.data.comment}
                                onChange={(event) =>
                                    cancelForm.setData(
                                        'comment',
                                        event.target.value,
                                    )
                                }
                                placeholder={t.cancellationReasonPlaceholder}
                                disabled={cancelForm.processing}
                                aria-invalid={Boolean(
                                    cancelForm.errors.comment,
                                )}
                            />
                            <InputError message={cancelForm.errors.comment} />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={cancelForm.processing}
                                >
                                    {t.cancel}
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={cancelRequest}
                                disabled={cancelForm.processing}
                            >
                                {cancelForm.processing ? (
                                    <Spinner />
                                ) : (
                                    <Ban className="size-4" />
                                )}
                                {cancelForm.processing
                                    ? t.processing
                                    : t.confirmCancellationAction}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
}
