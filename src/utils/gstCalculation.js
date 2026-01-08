export function calculateGST(amount, gstRate) {
    const gstAmount = (amount * gstRate) / 100;
    const totalAmount = amount + gstAmount;
    return {
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
    };
}

export function calculateInvoiceTotals(items, gstRate) {
    let totalBeforeTax = 0;
    let totalGST = 0;

    items.forEach(item => {
        const amount = parseFloat(item.amount) || 0;
        // If item has excludeGST set to true, use 0 as rate for this item
        // Otherwise use the global gstRate
        const effectiveRate = item.excludeGST ? 0 : gstRate;
        const { gstAmount } = calculateGST(amount, effectiveRate);

        totalBeforeTax += amount;
        totalGST += gstAmount;
    });

    const totalAfterTax = totalBeforeTax + totalGST;

    return {
        totalBeforeTax: parseFloat(totalBeforeTax.toFixed(2)),
        totalGST: parseFloat(totalGST.toFixed(2)),
        totalAfterTax: parseFloat(totalAfterTax.toFixed(2))
    };
}
