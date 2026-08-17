export type InvoiceStatus = 'draft' | 'paid' | 'pending' | 'overdue';

export type InvoiceType = 'sale' | 'purchase';

export type InvoiceCurrency = 'TRY' | 'USD' | 'EUR';

export type InvoiceItemType = 'product' | 'service';

export type InvoiceItemUnit = 'piece' | 'kg' | 'meter' | 'hour';

export type InvoiceScenario = 'eArchive' | 'eInvoice' | 'commercial' | 'basic';

export type InvoiceEType = 'sale' | 'return' | 'withholding' | 'exemption';

/* =========================================================
   CUSTOMER
   ========================================================= */

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

/* =========================================================
   SELLER / COMPANY
   ========================================================= */

export interface InvoiceCompany {
  title: string;
  taxNumber: string;
  taxOffice: string;

  mersisNumber: string;
  tradeRegistryNumber: string;

  phone: string;
  email: string;
  website: string;

  address: string;
  district: string;
  city: string;
  country: string;

  logoUrl: string;
}

/* =========================================================
   DOCUMENT
   ========================================================= */

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

/* =========================================================
   SOURCE DOCUMENT
   ========================================================= */

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

/* =========================================================
   INVOICE ITEMS
   ========================================================= */

export interface InvoiceItem {
  id: string;

  type: InvoiceItemType;

  productId: string;
  productName: string;
  productCode?: string;

  description: string;

  quantity: number;

  unit: InvoiceItemUnit;

  unitPrice: number;

  discountRate: number;

  vatRate: number;

  currency: InvoiceCurrency;

  lineTotal: number;
}

/* =========================================================
   PAYMENT
   ========================================================= */

export type InvoicePaymentMethod = 'cash' | 'bankTransfer' | 'creditCard' | 'other';

export interface InvoicePaymentInfo {
  method: InvoicePaymentMethod;

  accountName: string;
  bankName: string;
  iban: string;

  paymentDescription: string;

  /** Tahsil edilen tutar. Eski kayıtlarla uyumluluk için opsiyonel. */
  collectedAmount?: number;

  /** YYYY-MM-DD formatında tahsilat tarihi. */
  collectionDate?: string;
}

/* =========================================================
   ADDITIONAL / NOTES
   ========================================================= */

export interface InvoiceAdditionalInfo {
  /** Faturada müşteriye gösterilecek açıklama. */
  note: string;

  /** Sadece şirket içi kullanım için not. */
  privateNote: string;
}

/* =========================================================
   TAX / TOTALS
   ========================================================= */

export interface InvoiceVatBreakdown {
  rate: number;
  taxableAmount: number;
  vatAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;

  /** Eski kayıtlarda olmayabileceği için opsiyonel tutulur. */
  netSubtotal?: number;

  totalVat: number;
  grandTotal: number;

  /** KDV oranlarına göre matrah ve vergi dökümü. */
  vatBreakdown?: InvoiceVatBreakdown[];
}

/* =========================================================
   INVOICE
   ========================================================= */

export interface Invoice {
  id: number;

  invoiceNumber: string;
  customerName: string;

  issueDate: string;
  dueDate: string;

  amount: number;

  type: InvoiceType;
  status: InvoiceStatus;

  customer?: InvoiceCustomer;
  company?: InvoiceCompany;

  document?: InvoiceDocument;
  sourceDocuments?: InvoiceSourceDocument[];

  items?: InvoiceItem[];
  totals?: InvoiceTotals;

  payment?: InvoicePaymentInfo;
  additionalInfo?: InvoiceAdditionalInfo;
}

/* =========================================================
   CREATE / UPDATE
   ========================================================= */

export type CreateInvoiceInput = Omit<Invoice, 'id'>;

export type UpdateInvoiceInput = Omit<Invoice, 'id'>;

/* =========================================================
   SORTING
   ========================================================= */

export type InvoiceSortKey =
  'invoiceNumber' | 'customerName' | 'issueDate' | 'dueDate' | 'amount' | 'type' | 'status';

export type SortDirection = 'ascending' | 'descending';

export interface InvoiceSortConfig {
  key: InvoiceSortKey;
  direction: SortDirection;
}

/* =========================================================
   FILTERS
   ========================================================= */

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

/* =========================================================
   PAGINATION
   ========================================================= */

export type InvoicePageSize = 10 | 25 | 50;

export interface InvoicePaginationState {
  currentPage: number;
  pageSize: InvoicePageSize;
}
