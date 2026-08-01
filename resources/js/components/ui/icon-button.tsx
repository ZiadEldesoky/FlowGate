import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IconButtonProps = Omit<
    React.ComponentProps<typeof Button>,
    'children'
> & {
        label: string;
        children: React.ReactNode;
    };

function IconButton({
    className,
    label,
    children,
    variant = 'ghost',
    size = 'icon',
    ...props
}: IconButtonProps) {
    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            className={cn(className)}
            aria-label={label}
            title={label}
            {...props}
        >
            {children}
            <span className="sr-only">{label}</span>
        </Button>
    );
}

export { IconButton };
