import { useForm } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import {
    getDecisionActionLabel,
    getDecisionCopy,
} from '@/features/approvals/decision-i18n';
import { purchaseRequestRoutes } from '@/features/purchase-requests';
import type { PurchaseRequestDecisionAction } from '@/types/approvals';
import type { AppLocale } from '@/types/locale';

type DecisionDialogsProps = {
    purchaseRequestId: number;
    allowedActions: string[];
    locale: AppLocale;
};

function resolveApproveAction(
    allowedActions: string[],
): Extract<
    PurchaseRequestDecisionAction,
    'approve_manager_review' | 'approve_procurement_review'
> | null {
    if (allowedActions.includes('approve_manager_review')) {
        return 'approve_manager_review';
    }

    if (allowedActions.includes('approve_procurement_review')) {
        return 'approve_procurement_review';
    }

    return null;
}

function actionUrl(
    action: PurchaseRequestDecisionAction,
    purchaseRequestId: number,
): string {
    switch (action) {
        case 'approve_manager_review':
            return purchaseRequestRoutes.approveManagerReviewUrl(
                purchaseRequestId,
            );
        case 'approve_procurement_review':
            return purchaseRequestRoutes.approveProcurementReviewUrl(
                purchaseRequestId,
            );
        case 'reject':
            return purchaseRequestRoutes.rejectUrl(purchaseRequestId);
    }
}

export function DecisionDialogs({
    purchaseRequestId,
    allowedActions,
    locale,
}: DecisionDialogsProps) {
    const t = getDecisionCopy(locale);
    const approveAction = useMemo(
        () => resolveApproveAction(allowedActions),
        [allowedActions],
    );
    const canReject = allowedActions.includes('reject');

    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);

    const approveForm = useForm<{ comment: string | null }>({
        comment: null,
    });
    const rejectForm = useForm<{ comment: string }>({
        comment: '',
    });

    if (!approveAction && !canReject) {
        return null;
    }

    const onApprove = (): void => {
        if (!approveAction) {
            return;
        }

        const comment =
            approveForm.data.comment &&
            approveForm.data.comment.trim().length > 0
                ? approveForm.data.comment.trim()
                : null;

        approveForm.setData('comment', comment);
        approveForm.post(actionUrl(approveAction, purchaseRequestId), {
            preserveScroll: true,
            onSuccess: () => {
                setApproveOpen(false);
                approveForm.reset('comment');
                approveForm.clearErrors();
            },
        });
    };

    const onReject = (): void => {
        rejectForm.post(actionUrl('reject', purchaseRequestId), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectOpen(false);
                rejectForm.reset('comment');
                rejectForm.clearErrors();
            },
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {approveAction ? (
                <Dialog
                    open={approveOpen}
                    onOpenChange={(open) => {
                        if (approveForm.processing) {
                            return;
                        }

                        setApproveOpen(open);

                        if (!open) {
                            approveForm.clearErrors();
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button type="button" size="sm">
                            <Check className="size-4" />
                            {getDecisionActionLabel(approveAction, locale)}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {approveAction === 'approve_manager_review'
                                    ? t.approveTitleManager
                                    : t.approveTitleProcurement}
                            </DialogTitle>
                            <DialogDescription>
                                {t.approveDescription}
                            </DialogDescription>
                        </DialogHeader>

                        {Object.keys(approveForm.errors).length > 0 ? (
                            <Alert variant="destructive">
                                <AlertTitle>{t.validationSummary}</AlertTitle>
                                <AlertDescription>
                                    {approveForm.errors.comment ??
                                        t.validationSummary}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid gap-2">
                            <Label htmlFor="approve-comment">
                                {t.commentOptional}
                            </Label>
                            <Textarea
                                id="approve-comment"
                                value={approveForm.data.comment ?? ''}
                                onChange={(event) =>
                                    approveForm.setData(
                                        'comment',
                                        event.target.value,
                                    )
                                }
                                placeholder={t.commentPlaceholder}
                                disabled={approveForm.processing}
                                aria-invalid={Boolean(
                                    approveForm.errors.comment,
                                )}
                            />
                            <InputError message={approveForm.errors.comment} />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={approveForm.processing}
                                >
                                    {t.cancel}
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={onApprove}
                                disabled={approveForm.processing}
                            >
                                {approveForm.processing ? (
                                    <Spinner />
                                ) : (
                                    <Check className="size-4" />
                                )}
                                {approveForm.processing
                                    ? t.processing
                                    : t.confirmApprove}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}

            {canReject ? (
                <Dialog
                    open={rejectOpen}
                    onOpenChange={(open) => {
                        if (rejectForm.processing) {
                            return;
                        }

                        setRejectOpen(open);

                        if (!open) {
                            rejectForm.clearErrors();
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button type="button" size="sm" variant="destructive">
                            <X className="size-4" />
                            {t.reject}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t.rejectTitle}</DialogTitle>
                            <DialogDescription>
                                {t.rejectDescription}
                            </DialogDescription>
                        </DialogHeader>

                        {Object.keys(rejectForm.errors).length > 0 ? (
                            <Alert variant="destructive">
                                <AlertTitle>{t.validationSummary}</AlertTitle>
                                <AlertDescription>
                                    {rejectForm.errors.comment ??
                                        t.validationSummary}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid gap-2">
                            <Label htmlFor="reject-comment">
                                {t.commentRequired}
                                <span
                                    className="ms-1 text-destructive"
                                    aria-hidden
                                >
                                    *
                                </span>
                            </Label>
                            <Textarea
                                id="reject-comment"
                                value={rejectForm.data.comment}
                                onChange={(event) =>
                                    rejectForm.setData(
                                        'comment',
                                        event.target.value,
                                    )
                                }
                                placeholder={t.commentPlaceholder}
                                disabled={rejectForm.processing}
                                required
                                aria-required
                                aria-invalid={Boolean(
                                    rejectForm.errors.comment,
                                )}
                            />
                            <InputError message={rejectForm.errors.comment} />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={rejectForm.processing}
                                >
                                    {t.cancel}
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={onReject}
                                disabled={
                                    rejectForm.processing ||
                                    rejectForm.data.comment.trim().length === 0
                                }
                            >
                                {rejectForm.processing ? (
                                    <Spinner />
                                ) : (
                                    <X className="size-4" />
                                )}
                                {rejectForm.processing
                                    ? t.processing
                                    : t.confirmReject}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
}
