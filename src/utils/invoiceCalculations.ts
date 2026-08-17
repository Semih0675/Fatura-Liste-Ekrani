import type { InvoiceItem, InvoiceTotals, InvoiceVatBreakdown } from '../models/invoice';

export interface InvoiceLineAmounts {
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  vatAmount: number;
  lineTotal: number;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateInvoiceLine(
  item: Pick<InvoiceItem, 'quantity' | 'unitPrice' | 'discountRate' | 'vatRate'>,
): InvoiceLineAmounts {
  const grossAmount = roundMoney(item.quantity * item.unitPrice);

  const discountAmount = roundMoney(grossAmount * (item.discountRate / 100));

  const netAmount = roundMoney(grossAmount - discountAmount);

  const vatAmount = roundMoney(netAmount * (item.vatRate / 100));

  const lineTotal = roundMoney(netAmount + vatAmount);

  return {
    grossAmount,
    discountAmount,
    netAmount,
    vatAmount,
    lineTotal,
  };
}

export function calculateInvoiceTotals(items: InvoiceItem[]): InvoiceTotals {
  let subtotal = 0;
  let totalDiscount = 0;
  let netSubtotal = 0;
  let totalVat = 0;
  let grandTotal = 0;

  const vatMap = new Map<number, InvoiceVatBreakdown>();

  items.forEach((item) => {
    const amounts = calculateInvoiceLine(item);

    subtotal += amounts.grossAmount;
    totalDiscount += amounts.discountAmount;

    netSubtotal += amounts.netAmount;

    totalVat += amounts.vatAmount;

    grandTotal += amounts.lineTotal;

    const currentVat = vatMap.get(item.vatRate) ?? {
      rate: item.vatRate,
      taxableAmount: 0,
      vatAmount: 0,
    };

    currentVat.taxableAmount = roundMoney(currentVat.taxableAmount + amounts.netAmount);

    currentVat.vatAmount = roundMoney(currentVat.vatAmount + amounts.vatAmount);

    vatMap.set(item.vatRate, currentVat);
  });

  const vatBreakdown = [...vatMap.values()].sort((a, b) => a.rate - b.rate);

  return {
    subtotal: roundMoney(subtotal),

    totalDiscount: roundMoney(totalDiscount),

    netSubtotal: roundMoney(netSubtotal),

    totalVat: roundMoney(totalVat),

    grandTotal: roundMoney(grandTotal),

    vatBreakdown,
  };
}
