import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckSquare,
    LayoutGrid,
    Settings2,
    ShoppingCart,
} from 'lucide-react';
import AppLogo from '@/components/layout/app-logo';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { administrationRoutes } from '@/features/administration';
import { approvalRoutes } from '@/features/approvals';
import { notificationRoutes } from '@/features/notifications';
import { purchaseRequestRoutes } from '@/features/purchase-requests';
import { useDirection } from '@/hooks/use-direction';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { isRtl, locale } = useDirection();
    const { auth } = usePage().props;
    const canViewApprovals = auth.can.viewApprovalQueue;
    const canManageOrganization = auth.can.manageOrganization;
    const unreadNotificationsCount = auth.unreadNotificationsCount;

    const mainNavItems: NavItem[] = [
        {
            title: locale === 'ar' ? 'لوحة المتابعة' : 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: locale === 'ar' ? 'طلبات الشراء' : 'Purchase requests',
            href: purchaseRequestRoutes.index(),
            icon: ShoppingCart,
        },
        ...(canViewApprovals
            ? [
                  {
                      title: locale === 'ar' ? 'الموافقات' : 'Approvals',
                      href: approvalRoutes.index(),
                      icon: CheckSquare,
                  } satisfies NavItem,
              ]
            : []),
        {
            title: locale === 'ar' ? 'الإشعارات' : 'Notifications',
            href: notificationRoutes.index(),
            icon: Bell,
            badge: unreadNotificationsCount,
        },
        ...(canManageOrganization
            ? [
                  {
                      title: locale === 'ar' ? 'الإدارة' : 'Administration',
                      href: administrationRoutes.departments.index(),
                      icon: Settings2,
                  } satisfies NavItem,
              ]
            : []),
    ];

    return (
        <Sidebar
            side={isRtl ? 'right' : 'left'}
            collapsible="icon"
            variant="inset"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={purchaseRequestRoutes.index()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
