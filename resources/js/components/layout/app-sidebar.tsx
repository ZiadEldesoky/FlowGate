import { Link } from '@inertiajs/react';
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
import { useDirection } from '@/hooks/use-direction';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { isRtl, locale } = useDirection();

    const mainNavItems: NavItem[] = [
        {
            title: locale === 'ar' ? 'لوحة المتابعة' : 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: locale === 'ar' ? 'طلبات الشراء' : 'Purchase requests',
            href: dashboard(),
            icon: ShoppingCart,
        },
        {
            title: locale === 'ar' ? 'الموافقات' : 'Approvals',
            href: dashboard(),
            icon: CheckSquare,
        },
        {
            title: locale === 'ar' ? 'الإشعارات' : 'Notifications',
            href: dashboard(),
            icon: Bell,
        },
        {
            title: locale === 'ar' ? 'الإدارة' : 'Administration',
            href: dashboard(),
            icon: Settings2,
        },
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
                            <Link href={dashboard()} prefetch>
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
