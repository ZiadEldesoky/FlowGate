import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Database,
    GitBranch,
    Languages,
    ShieldCheck,
} from 'lucide-react';
import AppLogoIcon from '@/components/layout/app-logo-icon';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDirection } from '@/hooks/use-direction';
import { dashboard, login, register } from '@/routes';

const copy = {
    ar: {
        eyebrow: 'Laravel Modular Monolith',
        title: 'موافقات المشتريات بمسار واضح وقابل للتدقيق',
        description:
            'FlowGate مشروع عملي يوضح بناء workflow مؤسسي باستخدام Laravel، مع صلاحيات مركزية وانتقالات حالة ذرية وسجل نشاط موثوق.',
        openDashboard: 'فتح لوحة المتابعة',
        signIn: 'تسجيل الدخول',
        createAccount: 'إنشاء حساب تجريبي',
        engineeringTitle: 'ما الذي يوضحه المشروع؟',
        engineeringDescription:
            'حدود معمارية مباشرة تحافظ على منطق الأعمال في الخادم بدون طبقات شكلية.',
        points: [
            {
                title: 'Workflow واحد',
                description:
                    'مصدر وحيد لقواعد انتقال الحالات مع اختبارات matrix واضحة.',
                icon: GitBranch,
            },
            {
                title: 'صلاحيات مركزية',
                description:
                    'Laravel Policies هي الحد الوحيد لقرارات الوصول والتنفيذ.',
                icon: ShieldCheck,
            },
            {
                title: 'كتابة ذرية',
                description:
                    'الحالة والموافقة وسجل النشاط تُحفظ داخل transaction واحدة.',
                icon: Database,
            },
            {
                title: 'واجهة ثنائية الاتجاه',
                description: 'نفس المكونات تعمل بالعربية RTL والإنجليزية LTR.',
                icon: Languages,
            },
        ],
        statusTitle: 'لغة حالات موحّدة',
        statusDescription:
            'الألوان للعرض فقط؛ الخادم يظل مصدر الحقيقة للـworkflow.',
        repository: 'الكود على GitHub',
        quality:
            'Pest · Architecture Tests · Larastan · Pint · TypeScript · GitHub Actions',
    },
    en: {
        eyebrow: 'Laravel Modular Monolith',
        title: 'Procurement approvals with an explicit, auditable flow',
        description:
            'FlowGate is a practical Laravel project demonstrating an enterprise workflow with centralized authorization, atomic state transitions, and reliable activity history.',
        openDashboard: 'Open dashboard',
        signIn: 'Sign in',
        createAccount: 'Create demo account',
        engineeringTitle: 'What does the project demonstrate?',
        engineeringDescription:
            'Direct architectural boundaries that keep business behavior on the server without ceremonial layers.',
        points: [
            {
                title: 'One workflow',
                description:
                    'A single transition source backed by an explicit matrix test suite.',
                icon: GitBranch,
            },
            {
                title: 'Central authorization',
                description:
                    'Laravel Policies are the only boundary for access decisions.',
                icon: ShieldCheck,
            },
            {
                title: 'Atomic writes',
                description:
                    'Status, approval, and activity history commit in one transaction.',
                icon: Database,
            },
            {
                title: 'Bidirectional UI',
                description:
                    'The same components support Arabic RTL and English LTR.',
                icon: Languages,
            },
        ],
        statusTitle: 'Consistent status language',
        statusDescription:
            'Colors are presentation-only; the server remains the workflow source of truth.',
        repository: 'Source on GitHub',
        quality:
            'Pest · Architecture Tests · Larastan · Pint · TypeScript · GitHub Actions',
    },
} as const;

export default function Welcome() {
    const { auth, name } = usePage().props;
    const { locale } = useDirection();
    const t = copy[locale];

    return (
        <>
            <Head title={locale === 'ar' ? 'الرئيسية' : 'Home'} />

            <div className="min-h-svh bg-background text-foreground">
                <header className="border-b bg-card">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <AppLogoIcon className="size-5" />
                            </span>
                            <span className="truncate text-sm font-semibold">
                                {name}
                            </span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <LocaleSwitcher />
                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>
                                        {t.openDashboard}
                                        <ArrowRight className="size-4 rtl:rotate-180" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild size="sm" variant="outline">
                                    <Link href={login()}>{t.signIn}</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
                    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                        <div className="max-w-3xl space-y-6">
                            <p className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
                                {t.eyebrow}
                            </p>
                            <div className="space-y-4">
                                <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                                    {t.title}
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                    {t.description}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button asChild>
                                    <Link
                                        href={auth.user ? dashboard() : login()}
                                    >
                                        {auth.user ? t.openDashboard : t.signIn}
                                        <ArrowRight className="size-4 rtl:rotate-180" />
                                    </Link>
                                </Button>
                                {!auth.user ? (
                                    <Button asChild variant="outline">
                                        <Link href={register()}>
                                            {t.createAccount}
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>
                            <p className="text-xs leading-5 text-muted-foreground">
                                {t.quality}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card">
                            <div className="border-b px-5 py-4">
                                <h2 className="text-base font-semibold">
                                    {t.engineeringTitle}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t.engineeringDescription}
                                </p>
                            </div>
                            <ul className="divide-y">
                                {t.points.map(
                                    ({ title, description, icon: Icon }) => (
                                        <li
                                            key={title}
                                            className="flex gap-3 px-5 py-4"
                                        >
                                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-primary">
                                                <Icon
                                                    className="size-4"
                                                    aria-hidden
                                                />
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-medium">
                                                    {title}
                                                </h3>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {description}
                                                </p>
                                            </div>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    </section>

                    <section className="mt-12 border-y py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    {t.statusTitle}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t.statusDescription}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <StatusBadge status="draft" locale={locale} />
                                <StatusBadge status="pending" locale={locale} />
                                <StatusBadge
                                    status="approved"
                                    locale={locale}
                                />
                                <StatusBadge
                                    status="completed"
                                    locale={locale}
                                />
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 text-xs text-muted-foreground sm:px-6">
                        <span>© 2026 {name}</span>
                        <a
                            href="https://github.com/ZiadEldesoky/FlowGate"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            {t.repository}
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
