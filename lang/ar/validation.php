<?php

declare(strict_types=1);

return [
    'after_or_equal' => 'يجب أن يكون حقل :attribute تاريخًا بعد أو مساويًا لـ :date.',
    'array' => 'يجب أن يكون حقل :attribute قائمة صالحة.',
    'date_format' => 'يجب أن يطابق حقل :attribute التنسيق :format.',
    'decimal' => 'يجب ألا يتجاوز حقل :attribute عدد المنازل العشرية المسموح به.',
    'in' => 'القيمة المحددة في حقل :attribute غير صالحة.',
    'max' => [
        'array' => 'يجب ألا يحتوي حقل :attribute على أكثر من :max عناصر.',
        'numeric' => 'يجب ألا تزيد قيمة حقل :attribute على :max.',
        'string' => 'يجب ألا يزيد حقل :attribute على :max حرفًا.',
    ],
    'min' => [
        'array' => 'يجب أن يحتوي حقل :attribute على :min عنصر على الأقل.',
        'numeric' => 'يجب ألا تقل قيمة حقل :attribute عن :min.',
        'string' => 'يجب ألا يقل حقل :attribute عن :min أحرف.',
    ],
    'numeric' => 'يجب أن يكون حقل :attribute رقمًا.',
    'required' => 'حقل :attribute مطلوب.',
    'string' => 'يجب أن يكون حقل :attribute نصًا.',
];
