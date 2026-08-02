import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    ClipboardList,
    History,
    UserRoundCheck,
} from 'lucide-react';
import AppLogoIcon from '@/components/layout/app-logo-icon';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { AppearanceSwitcher } from '@/components/shared/appearance-switcher';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDirection } from '@/hooks/use-direction';
import { dashboard, login, register } from '@/routes';

const copy = {
    ar: {
        eyebrow: 'إدارة موافقات المشتريات',
        title: 'طلبات شراء أوضح، قرارات أسرع، ومسؤوليات قابلة للتتبّع',
        description:
            'يجمع FlowGate طلبات الشراء والمراجعات والقرارات في مسار واحد، حتى يعرف كل طرف ما ينتظره، وما تم اعتماده، ومن اتخذ القرار.',
        openDashboard: 'فتح لوحة المتابعة',
        signIn: 'تسجيل الدخول',
        createAccount: 'إنشاء حساب',
        solutionTitle: 'ما المشكلة التي يحلها FlowGate؟',
        solutionDescription:
            'بدلاً من ضياع الطلبات بين الرسائل والجداول، تصبح كل خطوة واضحة، مملوكة لصاحبها، وقابلة للمراجعة.',
        points: [
            {
                title: 'طلبات في مكان واحد',
                description:
                    'تظهر بيانات كل طلب ومرجعه ومقدّمه وقيمته وحالته الحالية في سجل واحد يسهل الرجوع إليه.',
                icon: ClipboardList,
            },
            {
                title: 'مسؤولية واضحة',
                description:
                    'ينتقل الطلب بين المدير والمشتريات حسب مرحلته، ويظهر الإجراء المطلوب للمسؤول المناسب.',
                icon: UserRoundCheck,
            },
            {
                title: 'قرارات قابلة للتدقيق',
                description:
                    'يُحفظ كل اعتماد أو رفض أو إلغاء مع صاحبه ووقته والملاحظات المرتبطة به.',
                icon: History,
            },
            {
                title: 'تنبيهات في الوقت المناسب',
                description:
                    'يصل أصحاب العلاقة إشعار عندما يصبح الطلب بحاجة إلى قرار أو تتغير حالته.',
                icon: BellRing,
            },
        ],
        statusTitle: 'حالة واضحة لكل طلب',
        statusDescription:
            'من المسودة حتى الاعتماد أو الإكمال، تظهر الحالة الحالية والخطوة التالية بوضوح.',
        valueLine: 'طلبات مركزية · مراجعات واضحة · سجل قرارات موثوق',
        footerTagline: 'نظّم الطلبات، وضّح المسؤولية، واحتفظ بسجل القرار.',
    },
    en: {
        eyebrow: 'Procurement approval management',
        title: 'Clearer purchase requests, faster decisions, and accountable ownership',
        description:
            'FlowGate brings purchase requests, reviews, and decisions into one workflow, so every stakeholder knows what is waiting, what was approved, and who made the decision.',
        openDashboard: 'Open dashboard',
        signIn: 'Sign in',
        createAccount: 'Create account',
        solutionTitle: 'What problem does FlowGate solve?',
        solutionDescription:
            'Instead of losing requests across messages and spreadsheets, every step becomes visible, owned, and reviewable.',
        points: [
            {
                title: 'Requests in one place',
                description:
                    'Every request keeps its reference, requester, amount, and current status in one record that is easy to revisit.',
                icon: ClipboardList,
            },
            {
                title: 'Clear ownership',
                description:
                    'Requests move between manager and procurement review by stage, with the required action shown to the right person.',
                icon: UserRoundCheck,
            },
            {
                title: 'Auditable decisions',
                description:
                    'Every approval, rejection, or cancellation is recorded with its actor, time, and supporting notes.',
                icon: History,
            },
            {
                title: 'Timely notifications',
                description:
                    'Relevant people are notified when a request needs a decision or its status changes.',
                icon: BellRing,
            },
        ],
        statusTitle: 'A clear status for every request',
        statusDescription:
            'From draft through approval or completion, the current status and next step remain easy to understand.',
        valueLine:
            'Centralized requests · Clear reviews · Reliable decision history',
        footerTagline:
            'Organize requests, clarify ownership, and preserve every decision.',
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
                            <AppearanceSwitcher />
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
                                {t.valueLine}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card">
                            <div className="border-b px-5 py-4">
                                <h2 className="text-base font-semibold">
                                    {t.solutionTitle}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t.solutionDescription}
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
                        <span>{t.footerTagline}</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
