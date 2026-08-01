import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PurchaseRequestCopy } from '@/features/purchase-requests/i18n';
import {
    MAX_PURCHASE_REQUEST_ITEMS,
    MIN_PURCHASE_REQUEST_ITEMS,
    nestedError,
} from '@/features/purchase-requests/utils';
import { cn } from '@/lib/utils';
import type { PurchaseRequestFormItem } from '@/types/purchase-request';

type ItemRowsEditorProps = {
    items: PurchaseRequestFormItem[];
    labels: PurchaseRequestCopy;
    errors: Partial<Record<string, string>>;
    onChange: (items: PurchaseRequestFormItem[]) => void;
    disabled?: boolean;
};

export function ItemRowsEditor({
    items,
    labels,
    errors,
    onChange,
    disabled = false,
}: ItemRowsEditorProps) {
    const canAdd = items.length < MAX_PURCHASE_REQUEST_ITEMS;
    const canRemove = items.length > MIN_PURCHASE_REQUEST_ITEMS;

    const updateItem = (
        index: number,
        patch: Partial<PurchaseRequestFormItem>,
    ): void => {
        onChange(
            items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...patch } : item,
            ),
        );
    };

    const removeItem = (index: number): void => {
        if (!canRemove) {
            return;
        }

        onChange(items.filter((_, itemIndex) => itemIndex !== index));
    };

    const addItem = (): void => {
        if (!canAdd) {
            return;
        }

        onChange([
            ...items,
            {
                description: '',
                sku: null,
                quantity: '1',
                unit_price: '0',
            },
        ]);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-medium text-foreground">
                        {labels.items}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {items.length} / {MAX_PURCHASE_REQUEST_ITEMS}
                    </p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addItem}
                    disabled={disabled || !canAdd}
                >
                    <Plus className="size-4" />
                    {labels.addItem}
                </Button>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => {
                    const descriptionError = nestedError(
                        errors,
                        `items.${index}.description`,
                    );
                    const skuError = nestedError(errors, `items.${index}.sku`);
                    const quantityError = nestedError(
                        errors,
                        `items.${index}.quantity`,
                    );
                    const unitPriceError = nestedError(
                        errors,
                        `items.${index}.unit_price`,
                    );

                    return (
                        <div
                            key={`item-${index}`}
                            className="grid gap-3 rounded-md border bg-card p-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_7rem_8rem_auto]"
                        >
                            <div className="grid gap-1.5">
                                <Label htmlFor={`items-${index}-description`}>
                                    {labels.itemDescription}
                                </Label>
                                <Input
                                    id={`items-${index}-description`}
                                    value={item.description}
                                    onChange={(event) =>
                                        updateItem(index, {
                                            description: event.target.value,
                                        })
                                    }
                                    disabled={disabled}
                                    aria-invalid={Boolean(descriptionError)}
                                />
                                {descriptionError ? (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {descriptionError}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor={`items-${index}-sku`}>
                                    {labels.sku}
                                </Label>
                                <Input
                                    id={`items-${index}-sku`}
                                    value={item.sku ?? ''}
                                    onChange={(event) =>
                                        updateItem(index, {
                                            sku:
                                                event.target.value.trim()
                                                    .length > 0
                                                    ? event.target.value
                                                    : null,
                                        })
                                    }
                                    disabled={disabled}
                                    aria-invalid={Boolean(skuError)}
                                />
                                {skuError ? (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {skuError}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor={`items-${index}-quantity`}>
                                    {labels.quantity}
                                </Label>
                                <Input
                                    id={`items-${index}-quantity`}
                                    inputMode="decimal"
                                    value={item.quantity}
                                    onChange={(event) =>
                                        updateItem(index, {
                                            quantity: event.target.value,
                                        })
                                    }
                                    disabled={disabled}
                                    aria-invalid={Boolean(quantityError)}
                                    className="font-mono tabular-nums"
                                />
                                {quantityError ? (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {quantityError}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor={`items-${index}-unit-price`}>
                                    {labels.unitPrice}
                                </Label>
                                <Input
                                    id={`items-${index}-unit-price`}
                                    inputMode="decimal"
                                    value={item.unit_price}
                                    onChange={(event) =>
                                        updateItem(index, {
                                            unit_price: event.target.value,
                                        })
                                    }
                                    disabled={disabled}
                                    aria-invalid={Boolean(unitPriceError)}
                                    className="font-mono tabular-nums"
                                />
                                {unitPriceError ? (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {unitPriceError}
                                    </p>
                                ) : null}
                            </div>

                            <div
                                className={cn(
                                    'flex items-end justify-end pb-0.5',
                                )}
                            >
                                <IconButton
                                    type="button"
                                    label={labels.removeItem}
                                    variant="ghost"
                                    disabled={disabled || !canRemove}
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="size-4" />
                                </IconButton>
                            </div>
                        </div>
                    );
                })}
            </div>

            {nestedError(errors, 'items') ? (
                <p role="alert" className="text-sm text-destructive">
                    {nestedError(errors, 'items')}
                </p>
            ) : null}
        </div>
    );
}
