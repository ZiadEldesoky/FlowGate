import AppLayoutTemplate from '@/components/layout/app/app-sidebar-layout';
import { useDirection } from '@/hooks/use-direction';
import { localizeBreadcrumbs } from '@/lib/navigation';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { locale } = useDirection();

    return (
        <AppLayoutTemplate
            breadcrumbs={localizeBreadcrumbs(breadcrumbs, locale)}
        >
            {children}
        </AppLayoutTemplate>
    );
}
