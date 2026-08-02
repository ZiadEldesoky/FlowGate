import AuthLayoutTemplate from '@/components/layout/auth/auth-simple-layout';
import { localizeAccountAuthLayout } from '@/features/account/i18n';
import { useDirection } from '@/hooks/use-direction';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const { locale } = useDirection();
    const localizedLayout = localizeAccountAuthLayout(
        locale,
        title,
        description,
    );

    return (
        <AuthLayoutTemplate
            title={localizedLayout.title}
            description={localizedLayout.description}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
