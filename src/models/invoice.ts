export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type InvoiceType = 'sale' | 'purchase';

export type InvoiceCurrency = 'TRY' | 'USD' | 'EUR';

export type InvoiceItemType = 'product' | 'service';

export type InvoiceItemUnit = 'piece' | 'kg' | 'meter' | 'hour';

export type InvoiceScenario = 'eArchive' | 'eInvoice' | 'commercial' | 'basic';

export type InvoiceEType = 'sale' | 'return' | 'withholding' | 'exemption';

export interface InvoiceCustomerAddress {
  addressName: string;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  avenue: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  addressCode: string;
  additionalDescription: string;
}

export interface InvoiceCustomer {
  id: string;
  name: string;
  titleName: string;

  taxNumber: string;
  taxOfficeCode: string;
  taxOfficeName: string;

  phone: string;
  email: string;

  address: InvoiceCustomerAddress;
}

export interface InvoiceDocument {
  series: string;
  number: string;
  description: string;

  dateTime: string;

  scenario: InvoiceScenario;
  eType: InvoiceEType;

  currency: InvoiceCurrency;

  ettn: string;

  cashier: string;
  label: string;

  internetSale: boolean;
  deliveryReplacement: boolean;
}

export interface InvoiceSourceDocument {
  id: string;

  documentType: string;
  documentNumber: string;
  documentDate: string;

  issuer: string;
  ettn: string;

  amount: number;
  currency: InvoiceCurrency;
}

export interface InvoiceItem {
  id: string;

  type: InvoiceItemType;

  productId: string;
  productName: string;

  description: string;

  quantity: number;
  unit: InvoiceItemUnit;

  unitPrice: number;

  discountRate: number;
  vatRate: number;

  currency: InvoiceCurrency;

  lineTotal: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  totalVat: number;
  grandTotal: number;
}

export interface Invoice {
  id: number;

  // Liste ekranındaki mevcut alanlar
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;

  type: InvoiceType;
  status: InvoiceStatus;

  // Yeni detaylı alanlar
  customer?: InvoiceCustomer;
  document?: InvoiceDocument;
  sourceDocuments?: InvoiceSourceDocument[];
  items?: InvoiceItem[];
  totals?: InvoiceTotals;
}

export type CreateInvoiceInput = Omit<Invoice, 'id'>;
export type UpdateInvoiceInput = Omit<Invoice, 'id'>;

export type InvoiceSortKey =
  'invoiceNumber' | 'customerName' | 'issueDate' | 'dueDate' | 'amount' | 'type' | 'status';

export type SortDirection = 'ascending' | 'descending';

export interface InvoiceSortConfig {
  key: InvoiceSortKey;
  direction: SortDirection;
}

export interface InvoiceFilterValues {
  searchTerm: string;

  type: InvoiceType | null;

  statuses: InvoiceStatus[];

  issueDateFrom: string | null;
  issueDateTo: string | null;

  minAmount: number | null;
  maxAmount: number | null;
}

export interface InvoiceFiltersState extends InvoiceFilterValues {
  sortConfig: InvoiceSortConfig;
}

export type InvoicePageSize = 10 | 25 | 50;

export interface InvoicePaginationState {
  currentPage: number;
  pageSize: InvoicePageSize;
}
