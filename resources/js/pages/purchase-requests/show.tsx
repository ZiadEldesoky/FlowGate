import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import {
    RequestActivitySection,
    RequestApprovalsSection,
    RequestItemsSection,
    RequestSummarySection,
    getPurchaseRequestCopy,
    purchaseRequestRoutes,
} from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import type { PurchaseRequestShowProps } from '@/types/purchase-request';

export default function PurchaseRequestsShow({
    purchaseRequest,
    allowedActions,
    can,
}: PurchaseRequestShowProps) {
    const { locale } = useDirection();
    const t = getPurchaseRequestCopy(locale);
    const canSubmit = allowedActions.includes('submit');

    const submitForm = useForm({});

    const onSubmit = (): void => {
        submitForm.post(purchaseRequestRoutes.submit(purchaseRequest.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t.showTitle} · ${purchaseRequest.reference}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={purchaseRequest.title}
                    description={purchaseRequest.reference}
                    actions={
                        <>
                            <Button asChild size="sm" variant="outline">
                                <Link href={purchaseRequestRoutes.index()}>
                                    <ArrowLeft className="size-4 rtl:rotate-180" />
                                    {t.backToList}
                                </Link>
                            </Button>
                            {can.update ? (
                                <Button asChild size="sm" variant="outline">
                                    <Link
                                        href={purchaseRequestRoutes.edit(
                                            purchaseRequest.id,
                                        )}
                                    >
                                        <Pencil className="size-4" />
                                        {t.edit}
                                    </Link>
                                </Button>
                            ) : null}
                            {canSubmit ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={onSubmit}
                                    disabled={submitForm.processing}
                                >
                                    {submitForm.processing ? (
                                        <Spinner />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                    {submitForm.processing
                                        ? t.processing
                                        : t.submit}
                                </Button>
                            ) : null}
                        </>
                    }
                />

                <RequestSummarySection
                    purchaseRequest={purchaseRequest}
                    locale={locale}
                    labels={t}
                />
                <RequestItemsSection
                    purchaseRequest={purchaseRequest}
                    labels={t}
                />
                <RequestApprovalsSection
                    purchaseRequest={purchaseRequest}
                    labels={t}
                />
                <RequestActivitySection
                    purchaseRequest={purchaseRequest}
                    locale={locale}
                    labels={t}
                />
            </div>
        </>
    );
}

PurchaseRequestsShow.layout = {
    breadcrumbs: [
        {
            title: 'Purchase requests',
            href: purchaseRequestRoutes.index(),
        },
    ],
};
