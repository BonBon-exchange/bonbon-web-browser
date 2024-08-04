
// sepyt/utils.ts

export function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
}

export function calculatePercentage(part: number, total: number): number {
    return (part / total) * 100;
}
