import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/shared/appearance-tabs';
import Heading from '@/components/shared/heading';
import { getAccountCopy } from '@/features/account/i18n';
import { useDirection } from '@/hooks/use-direction';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { locale } = useDirection();
    const t = getAccountCopy(locale).appearance;

    return (
        <>
            <Head title={t.pageTitle} />

            <h1 className="sr-only">{t.pageTitle}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t.title}
                    description={t.description}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
