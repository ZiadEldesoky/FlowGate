import { Head, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import {
    PurchaseRequestForm,
    createEmptyItem,
    getPurchaseRequestCopy,
    purchaseRequestRoutes,
} from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import type {
    PurchaseRequestCurrency,
    PurchaseRequestEditProps,
    PurchaseRequestFormPayload,
} from '@/types/purchase-request';

export default function PurchaseRequestsEdit({
    purchaseRequest,
}: PurchaseRequestEditProps) {
    const { locale } = useDirection();
    const t = getPurchaseRequestCopy(locale);

    const form = useForm<PurchaseRequestFormPayload>({
        title: purchaseRequest.title,
        justification: purchaseRequest.justification,
        needed_by: purchaseRequest.neededBy,
        currency:
            (purchaseRequest.currency as PurchaseRequestCurrency) || 'EGP',
        items:
            purchaseRequest.items.length > 0
                ? purchaseRequest.items.map((item) => ({
                      description: item.description,
                      sku: item.sku,
                      quantity: item.quantity,
                      unit_price: item.unitPrice,
                  }))
                : [createEmptyItem()],
    });

    const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        form.put(purchaseRequestRoutes.updateUrl(purchaseRequest.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t.editTitle} · ${purchaseRequest.reference}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.editTitle}
                    description={`${purchaseRequest.reference} · ${t.editDescription}`}
                />

                <PurchaseRequestForm
                    mode="edit"
                    locale={locale}
                    labels={t}
                    data={form.data}
                    setData={form.setData}
                    clearError={(field) => form.clearErrors(field)}
                    errors={form.errors}
                    processing={form.processing}
                    onSubmit={onSubmit}
                    cancelHref={purchaseRequestRoutes.showUrl(
                        purchaseRequest.id,
                    )}
                />
            </div>
        </>
    );
}

PurchaseRequestsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Purchase requests',
            href: purchaseRequestRoutes.index(),
        },
        {
            title: 'Edit',
            href: purchaseRequestRoutes.index(),
        },
    ],
};
