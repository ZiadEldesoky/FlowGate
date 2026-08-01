import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps = {
    id: string;
    label: string;
    description?: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
};

function FormField({
    id,
    label,
    description,
    error,
    required = false,
    className,
    children,
}: FormFieldProps) {
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div
            data-slot="form-field"
            className={cn('grid gap-2', className)}
        >
            <Label htmlFor={id}>
                {label}
                {required ? (
                    <span className="ms-1 text-destructive" aria-hidden>
                        *
                    </span>
                ) : null}
            </Label>
            {children}
            {description ? (
                <p
                    id={descriptionId}
                    className="text-xs text-muted-foreground"
                >
                    {description}
                </p>
            ) : null}
            {error ? (
                <p
                    id={errorId}
                    role="alert"
                    className="text-sm text-destructive"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}

export { FormField };
export type { FormFieldProps };
