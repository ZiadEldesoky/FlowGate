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
    PurchaseRequestCreateProps,
    PurchaseRequestFormPayload,
} from '@/types/purchase-request';

export default function PurchaseRequestsCreate({
    department,
    defaults,
}: PurchaseRequestCreateProps) {
    const { locale } = useDirection();
    const t = getPurchaseRequestCopy(locale);

    const form = useForm<PurchaseRequestFormPayload>({
        title: '',
        justification: '',
        needed_by: null,
        currency: defaults.currency,
        items: [createEmptyItem()],
    });

    const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        form.post(purchaseRequestRoutes.storeUrl(), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t.createTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={t.createTitle}
                    description={t.createDescription}
                />

                <PurchaseRequestForm
                    mode="create"
                    locale={locale}
                    labels={t}
                    department={department}
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    processing={form.processing}
                    onSubmit={onSubmit}
                />
            </div>
        </>
    );
}

PurchaseRequestsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Purchase requests',
            href: purchaseRequestRoutes.index(),
        },
        {
            title: 'Create',
            href: purchaseRequestRoutes.create(),
        },
    ],
};
