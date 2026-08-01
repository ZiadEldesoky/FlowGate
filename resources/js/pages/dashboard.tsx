import { Head, Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import {
    getPurchaseRequestCopy,
    purchaseRequestRoutes,
} from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import { dashboard } from '@/routes';

/**
 * Authenticated dashboard entry.
 * Backend will redirect /dashboard to purchase request index; this page remains a safe fallback shell.
 */
export default function Dashboard() {
    const { locale } = useDirection();
    const t = getPurchaseRequestCopy(locale);

    return (
        <>
            <Head title={locale === 'ar' ? 'لوحة المتابعة' : 'Dashboard'} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <PageHeader
                    title={locale === 'ar' ? 'لوحة المتابعة' : 'Dashboard'}
                    description={
                        locale === 'ar'
                            ? 'الانتقال إلى مسار طلبات الشراء.'
                            : 'Continue to the purchase request workspace.'
                    }
                    actions={
                        <Button asChild size="sm">
                            <Link href={purchaseRequestRoutes.index()}>
                                <ShoppingCart className="size-4" />
                                {t.indexTitle}
                            </Link>
                        </Button>
                    }
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
