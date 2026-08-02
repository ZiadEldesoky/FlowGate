import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useDirection } from '@/hooks/use-direction';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { isRtl, locale } = useDirection();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>
                {locale === 'ar' ? 'التنقل' : 'Navigation'}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.disabled ? (
                            <SidebarMenuButton
                                type="button"
                                disabled
                                tooltip={{
                                    children: item.title,
                                    side: isRtl ? 'left' : 'right',
                                }}
                            >
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{
                                    children: item.title,
                                    side: isRtl ? 'left' : 'right',
                                }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                        {item.badge && item.badge > 0 ? (
                            <SidebarMenuBadge>
                                {item.badge > 99 ? '99+' : item.badge}
                            </SidebarMenuBadge>
                        ) : null}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
