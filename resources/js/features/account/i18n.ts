import type { AppLocale } from '@/types/locale';

const accountCopy = {
    ar: {
        menu: {
            settings: 'الإعدادات',
            logout: 'تسجيل الخروج',
        },
        settings: {
            title: 'الإعدادات',
            description: 'إدارة الملف الشخصي وإعدادات الحساب',
            navigationLabel: 'إعدادات الحساب',
            profile: 'الملف الشخصي',
            security: 'الأمان',
            appearance: 'المظهر',
        },
        profile: {
            pageTitle: 'إعدادات الملف الشخصي',
            title: 'الملف الشخصي',
            description: 'تحديث الاسم وعنوان البريد الإلكتروني',
            name: 'الاسم',
            namePlaceholder: 'الاسم الكامل',
            email: 'البريد الإلكتروني',
            emailPlaceholder: 'البريد الإلكتروني',
            unverified: 'لم يتم التحقق من بريدك الإلكتروني.',
            resendVerification: 'اضغط هنا لإعادة إرسال رسالة التحقق.',
            verificationSent: 'تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني.',
            save: 'حفظ',
        },
        security: {
            pageTitle: 'إعدادات الأمان',
            title: 'تحديث كلمة المرور',
            description:
                'استخدم كلمة مرور طويلة وعشوائية للحفاظ على أمان حسابك',
            currentPassword: 'كلمة المرور الحالية',
            newPassword: 'كلمة المرور الجديدة',
            confirmPassword: 'تأكيد كلمة المرور',
            save: 'حفظ',
        },
        appearance: {
            pageTitle: 'إعدادات المظهر',
            title: 'إعدادات المظهر',
            description: 'تحديث مظهر حسابك',
        },
        password: {
            show: 'إظهار كلمة المرور',
            hide: 'إخفاء كلمة المرور',
        },
        deleteAccount: {
            title: 'حذف الحساب',
            description: 'حذف حسابك وجميع موارده',
            warning: 'تحذير',
            warningDescription:
                'يرجى المتابعة بحذر؛ لا يمكن التراجع عن هذا الإجراء.',
            trigger: 'حذف الحساب',
            confirmTitle: 'هل أنت متأكد من رغبتك في حذف حسابك؟',
            confirmDescription:
                'عند حذف الحساب ستُحذف جميع موارده وبياناته نهائيًا. أدخل كلمة المرور لتأكيد الحذف الدائم.',
            password: 'كلمة المرور',
            cancel: 'إلغاء',
            confirm: 'حذف الحساب',
        },
        twoFactor: {
            title: 'المصادقة الثنائية',
            description: 'إدارة إعدادات المصادقة الثنائية لحسابك',
            enabledDescription:
                'سيُطلب منك رمز أمان عشوائي عند تسجيل الدخول، ويمكنك الحصول عليه من تطبيق المصادقة على هاتفك.',
            disabledDescription:
                'عند تفعيل المصادقة الثنائية سيُطلب منك رمز أمان عند تسجيل الدخول، ويمكنك الحصول عليه من تطبيق المصادقة على هاتفك.',
            disable: 'تعطيل المصادقة الثنائية',
            enable: 'تفعيل المصادقة الثنائية',
            continueSetup: 'متابعة الإعداد',
            enabledTitle: 'تم تفعيل المصادقة الثنائية',
            enabledSetupDescription:
                'المصادقة الثنائية مفعّلة الآن. امسح رمز QR أو أدخل مفتاح الإعداد في تطبيق المصادقة.',
            verifyTitle: 'التحقق من رمز المصادقة',
            verifyDescription:
                'أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة',
            enableTitle: 'تفعيل المصادقة الثنائية',
            enableDescription:
                'لإكمال التفعيل، امسح رمز QR أو أدخل مفتاح الإعداد في تطبيق المصادقة.',
            close: 'إغلاق',
            continue: 'متابعة',
            manualEntry: 'أو أدخل الرمز يدويًا',
            copySetupKey: 'نسخ مفتاح الإعداد',
            back: 'رجوع',
            confirm: 'تأكيد',
        },
        recoveryCodes: {
            title: 'رموز استرداد المصادقة الثنائية',
            description:
                'تساعدك رموز الاسترداد على استعادة الوصول إذا فقدت جهاز المصادقة. احفظها في مدير كلمات مرور آمن.',
            view: 'عرض رموز الاسترداد',
            hide: 'إخفاء رموز الاسترداد',
            regenerate: 'إعادة إنشاء الرموز',
            listLabel: 'رموز الاسترداد',
            loadingLabel: 'جارٍ تحميل رموز الاسترداد',
            warning:
                'يمكن استخدام كل رمز استرداد مرة واحدة، وسيُحذف بعد استخدامه. إذا احتجت رموزًا إضافية، استخدم زر إعادة إنشاء الرموز أعلاه.',
        },
        passkeys: {
            title: 'مفاتيح المرور',
            description: 'إدارة مفاتيح المرور لتسجيل الدخول دون كلمة مرور',
            emptyTitle: 'لا توجد مفاتيح مرور بعد',
            emptyDescription: 'أضف مفتاح مرور لتسجيل الدخول دون كلمة مرور',
            unsupported: 'مفاتيح المرور غير مدعومة في هذا المتصفح.',
            add: 'إضافة مفتاح مرور',
            name: 'اسم مفتاح المرور',
            placeholder: 'مثال: MacBook Pro أو iPhone',
            hint: 'يساعدك الاسم على تمييز مفتاح المرور لاحقًا.',
            registering: 'جارٍ التسجيل…',
            register: 'تسجيل مفتاح المرور',
            cancel: 'إلغاء',
            deviceJoiner: 'على',
            added: 'أُضيف',
            lastUsed: 'آخر استخدام',
            removeLabel: 'إزالة',
            removeTitle: 'إزالة مفتاح المرور',
            removeDescription: (name: string) =>
                `هل تريد إزالة مفتاح المرور «${name}»؟ لن تتمكن من استخدامه لتسجيل الدخول بعد ذلك.`,
            removing: 'جارٍ الإزالة…',
            remove: 'إزالة مفتاح المرور',
        },
        verifyEmail: {
            pageTitle: 'التحقق من البريد الإلكتروني',
            title: 'التحقق من البريد الإلكتروني',
            description:
                'تحقق من بريدك الإلكتروني بالضغط على الرابط الذي أرسلناه إليك.',
            sent: 'تم إرسال رابط تحقق جديد إلى البريد الإلكتروني الذي أدخلته أثناء التسجيل.',
            resend: 'إعادة إرسال رسالة التحقق',
            logout: 'تسجيل الخروج',
        },
    },
    en: {
        menu: {
            settings: 'Settings',
            logout: 'Log out',
        },
        settings: {
            title: 'Settings',
            description: 'Manage your profile and account settings',
            navigationLabel: 'Account settings',
            profile: 'Profile',
            security: 'Security',
            appearance: 'Appearance',
        },
        profile: {
            pageTitle: 'Profile settings',
            title: 'Profile',
            description: 'Update your name and email address',
            name: 'Name',
            namePlaceholder: 'Full name',
            email: 'Email address',
            emailPlaceholder: 'Email address',
            unverified: 'Your email address is unverified.',
            resendVerification: 'Click here to re-send the verification email.',
            verificationSent:
                'A new verification link has been sent to your email address.',
            save: 'Save',
        },
        security: {
            pageTitle: 'Security settings',
            title: 'Update password',
            description:
                'Ensure your account is using a long, random password to stay secure',
            currentPassword: 'Current password',
            newPassword: 'New password',
            confirmPassword: 'Confirm password',
            save: 'Save',
        },
        appearance: {
            pageTitle: 'Appearance settings',
            title: 'Appearance settings',
            description: 'Update the appearance settings for your account',
        },
        password: {
            show: 'Show password',
            hide: 'Hide password',
        },
        deleteAccount: {
            title: 'Delete account',
            description: 'Delete your account and all of its resources',
            warning: 'Warning',
            warningDescription:
                'Please proceed with caution, this cannot be undone.',
            trigger: 'Delete account',
            confirmTitle: 'Are you sure you want to delete your account?',
            confirmDescription:
                'Once your account is deleted, all of its resources and data will also be permanently deleted. Enter your password to confirm permanent deletion.',
            password: 'Password',
            cancel: 'Cancel',
            confirm: 'Delete account',
        },
        twoFactor: {
            title: 'Two-factor authentication',
            description: 'Manage your two-factor authentication settings',
            enabledDescription:
                'You will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone.',
            disabledDescription:
                'When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone.',
            disable: 'Disable 2FA',
            enable: 'Enable 2FA',
            continueSetup: 'Continue setup',
            enabledTitle: 'Two-factor authentication enabled',
            enabledSetupDescription:
                'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
            verifyTitle: 'Verify authentication code',
            verifyDescription:
                'Enter the 6-digit code from your authenticator app',
            enableTitle: 'Enable two-factor authentication',
            enableDescription:
                'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app.',
            close: 'Close',
            continue: 'Continue',
            manualEntry: 'or, enter the code manually',
            copySetupKey: 'Copy setup key',
            back: 'Back',
            confirm: 'Confirm',
        },
        recoveryCodes: {
            title: '2FA recovery codes',
            description:
                'Recovery codes let you regain access if you lose your 2FA device. Store them in a secure password manager.',
            view: 'View recovery codes',
            hide: 'Hide recovery codes',
            regenerate: 'Regenerate codes',
            listLabel: 'Recovery codes',
            loadingLabel: 'Loading recovery codes',
            warning:
                'Each recovery code can be used once to access your account and will be removed after use. If you need more, use Regenerate codes above.',
        },
        passkeys: {
            title: 'Passkeys',
            description: 'Manage your passkeys for passwordless sign-in',
            emptyTitle: 'No passkeys yet',
            emptyDescription: 'Add a passkey to sign in without a password',
            unsupported: 'Passkeys are not supported in this browser.',
            add: 'Add passkey',
            name: 'Passkey name',
            placeholder: 'e.g., MacBook Pro, iPhone',
            hint: 'A name helps you identify this passkey later.',
            registering: 'Registering...',
            register: 'Register passkey',
            cancel: 'Cancel',
            deviceJoiner: 'on',
            added: 'Added',
            lastUsed: 'Last used',
            removeLabel: 'Remove',
            removeTitle: 'Remove passkey',
            removeDescription: (name: string) =>
                `Are you sure you want to remove the "${name}" passkey? You will no longer be able to use it to sign in.`,
            removing: 'Removing...',
            remove: 'Remove passkey',
        },
        verifyEmail: {
            pageTitle: 'Email verification',
            title: 'Email verification',
            description:
                'Please verify your email address by clicking on the link we just emailed to you.',
            sent: 'A new verification link has been sent to the email address you provided during registration.',
            resend: 'Resend verification email',
            logout: 'Log out',
        },
    },
} as const;

export function getAccountCopy(locale: AppLocale) {
    return accountCopy[locale];
}

export function localizeAccountAuthLayout(
    locale: AppLocale,
    title: string,
    description: string,
) {
    const verifyEmail = accountCopy[locale].verifyEmail;

    if (title !== accountCopy.en.verifyEmail.title) {
        return { title, description };
    }

    return {
        title: verifyEmail.title,
        description: verifyEmail.description,
    };
}
