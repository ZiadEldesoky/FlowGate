import { useSyncExternalStore } from 'react';
import type { AppLocale, TextDirection } from '@/types/locale';

export type UseDirectionReturn = {
    readonly locale: AppLocale;
    readonly direction: TextDirection;
    readonly isRtl: boolean;
    readonly updateLocale: (locale: AppLocale) => void;
    readonly toggleLocale: () => void;
};

const STORAGE_KEY = 'flowgate-locale';
const listeners = new Set<() => void>();
let currentLocale: AppLocale = 'ar';

const isBrowser = (): boolean => typeof window !== 'undefined';

const readStoredLocale = (): AppLocale => {
    if (!isBrowser()) {
        return 'ar';
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    return stored === 'en' ? 'en' : 'ar';
};

const directionFor = (locale: AppLocale): TextDirection =>
    locale === 'ar' ? 'rtl' : 'ltr';

const applyDocumentDirection = (locale: AppLocale): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const direction = directionFor(locale);
    const root = document.documentElement;

    root.lang = locale;
    root.dir = direction;
    root.dataset.locale = locale;
    root.dataset.direction = direction;
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => {
    listeners.forEach((listener) => listener());
};

export function initializeDirection(defaultLocale: AppLocale = 'ar'): void {
    if (!isBrowser()) {
        return;
    }

    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, defaultLocale);
    }

    currentLocale = readStoredLocale();
    applyDocumentDirection(currentLocale);
}

export function useDirection(): UseDirectionReturn {
    const locale: AppLocale = useSyncExternalStore<AppLocale>(
        subscribe,
        () => currentLocale,
        () => 'ar',
    );

    const direction = directionFor(locale);

    const updateLocale = (next: AppLocale): void => {
        currentLocale = next;

        if (isBrowser()) {
            localStorage.setItem(STORAGE_KEY, next);
        }

        applyDocumentDirection(next);
        notify();
    };

    const toggleLocale = (): void => {
        updateLocale(locale === 'ar' ? 'en' : 'ar');
    };

    return {
        locale,
        direction,
        isRtl: direction === 'rtl',
        updateLocale,
        toggleLocale,
    };
}
