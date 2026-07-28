import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      title: 'Fatura Listesi',

      intro: {
        eyebrow: 'Fatura yönetimi',
        description: 'Faturalarınızı görüntüleyin ve finansal durumunuzu takip edin.',
      },

      header: {
        hideTable: 'Tabloyu Gizle',
        showTable: 'Tabloyu Göster',
      },

      actions: {
        newInvoice: 'Yeni Fatura',
        details: 'Detay',
        close: 'Kapat',
        retry: 'Tekrar Dene',
      },

      invoiceType: {
        sale: 'Satış',
        purchase: 'Alış',
      },

      invoiceStatus: {
        paid: 'Ödendi',
        pending: 'Bekliyor',
        overdue: 'Gecikmiş',
      },

      errors: {
        invoiceFetch: 'Fatura verileri alınamadı.',
      },

      error: {
        title: 'Bir hata oluştu',
      },

      summary: {
        ariaLabel: 'Fatura özeti',
        filteredInvoiceLabel: 'Filtrelenen Fatura',
        invoiceCountValue: '{{count}} adet',
        totalRecordCount: '{{count}} toplam kayıt',
        filteredAmountLabel: 'Filtrelenen Tutar',
        activeFilterResults: 'Aktif filtre sonuçları',
        overdueAmountLabel: 'Geciken Tutar',
        overdueInvoiceCount: '{{count}} gecikmiş fatura',
      },

      filters: {
        title: 'Filtreler',
        description: 'Listeyi bir veya birden fazla alana göre filtreleyin.',
        resultCount: '{{resultCount}} / {{totalCount}} kayıt',
        search: 'Arama',
        searchPlaceholder: 'Fatura numarası veya müşteri',
        type: 'Fatura tipi',
        allTypes: 'Tüm tipler',
        status: 'Durum',
        allStatuses: 'Tüm durumlar',
        noOptions: 'Seçenek bulunamadı',
        issueDateFrom: 'Düzenleme tarihi başlangıç',
        issueDateTo: 'Düzenleme tarihi bitiş',
        startDatePlaceholder: 'Başlangıç tarihi',
        endDatePlaceholder: 'Bitiş tarihi',
        minAmount: 'Minimum tutar',
        maxAmount: 'Maksimum tutar',
        clear: 'Filtreleri Temizle',
        apply: 'Filtreleri Uygula',
      },

      table: {
        hiddenTitle: 'Tablo gizlendi',
        hiddenDescription: 'Tabloyu yeniden görüntülemek için üst bölümdeki butona basın.',
        title: 'Faturalar',
        description: 'Kolon başlıklarına tıklayarak sıralayabilirsiniz.',
        caption: 'Sayfalanmış fatura listesi',
        rowCount: '{{count}} satır',
        invoiceNumber: 'Fatura No',
        customer: 'Müşteri',
        issueDate: 'Düzenleme Tarihi',
        dueDate: 'Vade Tarihi',
        amount: 'Tutar',
        type: 'Tip',
        status: 'Durum',
        action: 'İşlem',
        emptyTitle: 'Fatura bulunamadı',
        emptyDescription: 'Filtrelerinizi değiştirerek tekrar deneyin.',
      },

      pagination: {
        ariaLabel: 'Fatura sayfalaması',
        summary: '{{startItem}}-{{endItem}} / {{totalItems}} kayıt',
        pageSize: 'Sayfa başına',
        previous: 'Önceki sayfa',
        next: 'Sonraki sayfa',
        goToPage: '{{page}}. sayfaya git',
      },

      modal: {
        title: 'Fatura detayı',
        amount: 'Fatura tutarı',
        customer: 'Müşteri',
        issueDate: 'Düzenleme tarihi',
        dueDate: 'Vade tarihi',
        type: 'Fatura tipi',
        status: 'Durum',
        invoiceId: 'Fatura ID: {{id}}',
        closeAriaLabel: 'Fatura detay penceresini kapat',
      },

      loading: {
        message: 'Faturalar yükleniyor...',
      },

      empty: {
        title: 'Henüz fatura bulunmuyor',
        description: 'API başarıyla yanıt verdi ancak görüntülenecek fatura bulunamadı.',
      },

      document: {
        invoiceList: 'PreAccounting | Fatura Listesi',
        tableHidden: 'PreAccounting | Tablo Gizli',
      },

      createInvoice: {
        title: 'Yeni Fatura',
        invoiceNumber: 'Fatura numarası',
        customerName: 'Müşteri',
        issueDate: 'Düzenleme tarihi',
        dueDate: 'Vade tarihi',
        amount: 'Tutar',
        type: 'Fatura tipi',
        status: 'Durum',
        save: 'Faturayı Kaydet',
        close: 'Yeni fatura penceresini kapat',

        validation: {
          searchMax: 'Arama metni en fazla 100 karakter olabilir.',
          invalidDate: 'Geçerli bir tarih seçin.',
          endDateBeforeStart: 'Bitiş tarihi başlangıç tarihinden önce olamaz.',
          invalidAmount: 'Geçerli bir tutar girin.',
          negativeAmount: 'Tutar negatif olamaz.',
          maxLessThanMin: 'Maksimum tutar minimum tutardan küçük olamaz.',
          invoiceNumber: 'Fatura numarası zorunludur.',
          customerName: 'Müşteri adı zorunludur.',
          issueDate: 'Düzenleme tarihi zorunludur.',
          dueDate: 'Vade tarihi zorunludur.',
          dateOrder: 'Vade tarihi düzenleme tarihinden önce olamaz.',
          amount: 'Geçerli bir tutar girin.',
          positiveAmount: 'Tutar sıfırdan büyük olmalıdır.',
        },
      },
      language: {
        selector: 'Dil seçimi',
      },
    },
  },

  en: {
    translation: {
      title: 'Invoice List',

      intro: {
        eyebrow: 'Invoice management',
        description: 'View your invoices and track your financial status.',
      },

      header: {
        hideTable: 'Hide Table',
        showTable: 'Show Table',
      },

      actions: {
        newInvoice: 'New Invoice',
        details: 'Details',
        close: 'Close',
        retry: 'Try Again',
      },

      invoiceType: {
        sale: 'Sale',
        purchase: 'Purchase',
      },

      invoiceStatus: {
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
      },

      errors: {
        invoiceFetch: 'Invoice data could not be loaded.',
      },

      error: {
        title: 'An error occurred',
      },

      summary: {
        ariaLabel: 'Invoice summary',
        filteredInvoiceLabel: 'Filtered Invoices',
        invoiceCountValue: '{{count}} invoices',
        totalRecordCount: '{{count}} total records',
        filteredAmountLabel: 'Filtered Amount',
        activeFilterResults: 'Active filter results',
        overdueAmountLabel: 'Overdue Amount',
        overdueInvoiceCount: '{{count}} overdue invoices',
      },

      filters: {
        title: 'Filters',
        description: 'Filter the list by one or more fields.',
        resultCount: '{{resultCount}} / {{totalCount}} records',
        search: 'Search',
        searchPlaceholder: 'Invoice number or customer',
        type: 'Invoice type',
        allTypes: 'All types',
        status: 'Status',
        allStatuses: 'All statuses',
        noOptions: 'No options found',
        issueDateFrom: 'Issue date from',
        issueDateTo: 'Issue date to',
        startDatePlaceholder: 'Start date',
        endDatePlaceholder: 'End date',
        minAmount: 'Minimum amount',
        maxAmount: 'Maximum amount',
        clear: 'Clear Filters',
        apply: 'Apply Filters',
      },

      table: {
        hiddenTitle: 'Table hidden',
        hiddenDescription: 'Use the button in the header to display the table again.',
        title: 'Invoices',
        description: 'Click column headers to sort the list.',
        caption: 'Paginated invoice list',
        rowCount_one: '{{count}} row',
        rowCount_other: '{{count}} rows',
        invoiceNumber: 'Invoice No',
        customer: 'Customer',
        issueDate: 'Issue Date',
        dueDate: 'Due Date',
        amount: 'Amount',
        type: 'Type',
        status: 'Status',
        action: 'Action',
        emptyTitle: 'No invoices found',
        emptyDescription: 'Change your filters and try again.',
      },

      pagination: {
        ariaLabel: 'Invoice pagination',
        summary: '{{startItem}}-{{endItem}} of {{totalItems}} records',
        pageSize: 'Per page',
        previous: 'Previous page',
        next: 'Next page',
        goToPage: 'Go to page {{page}}',
      },

      modal: {
        title: 'Invoice details',
        amount: 'Invoice amount',
        customer: 'Customer',
        issueDate: 'Issue date',
        dueDate: 'Due date',
        type: 'Invoice type',
        status: 'Status',
        invoiceId: 'Invoice ID: {{id}}',
        closeAriaLabel: 'Close invoice details window',
      },

      loading: {
        message: 'Invoices are loading...',
      },

      empty: {
        title: 'No invoices found',
        description: 'The API responded successfully, but no invoices were found.',
      },

      document: {
        invoiceList: 'PreAccounting | Invoice List',
        tableHidden: 'PreAccounting | Table Hidden',
      },
      createInvoice: {
        title: 'New Invoice',
        invoiceNumber: 'Invoice number',
        customerName: 'Customer',
        issueDate: 'Issue date',
        dueDate: 'Due date',
        amount: 'Amount',
        type: 'Invoice type',
        status: 'Status',
        save: 'Save Invoice',
        close: 'Close new invoice window',

        validation: {
          invoiceNumber: 'Invoice number is required.',
          customerName: 'Customer name is required.',
          issueDate: 'Issue date is required.',
          dueDate: 'Due date is required.',
          dateOrder: 'The due date cannot be before the issue date.',
          amount: 'Enter a valid amount.',
          positiveAmount: 'The amount must be greater than zero.',
        },
      },

      language: {
        selector: 'Language selection',
      },
    },
  },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: 'tr',
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
