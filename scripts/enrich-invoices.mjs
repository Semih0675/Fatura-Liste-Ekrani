import fs from 'node:fs/promises';

const databaseUrl = new URL('../mock-api/db.json', import.meta.url);

const backupUrl = new URL('../mock-api/db.backup.json', import.meta.url);

const databaseText = await fs.readFile(databaseUrl, 'utf8');

const database = JSON.parse(databaseText);

const customerProfiles = {
  'Yılmaz Ticaret A.Ş.': {
    city: 'Ankara',
    district: 'Çankaya',
    taxOffice: 'Çankaya',
  },

  'Demir İnşaat Ltd. Şti.': {
    city: 'Ankara',
    district: 'Yenimahalle',
    taxOffice: 'Yenimahalle',
  },

  'Aksa Gıda San. A.Ş.': {
    city: 'İstanbul',
    district: 'Ümraniye',
    taxOffice: 'Ümraniye',
  },

  'Kaya Otomotiv': {
    city: 'Ankara',
    district: 'Etimesgut',
    taxOffice: 'Etimesgut',
  },

  'Öztürk Tekstil Ltd.': {
    city: 'İstanbul',
    district: 'Merter',
    taxOffice: 'Güngören',
  },

  'Mavi Lojistik A.Ş.': {
    city: 'İstanbul',
    district: 'Tuzla',
    taxOffice: 'Tuzla',
  },

  'Ege Elektronik': {
    city: 'İzmir',
    district: 'Bornova',
    taxOffice: 'Bornova',
  },

  'Anadolu Yazılım Ltd.': {
    city: 'Ankara',
    district: 'Çankaya',
    taxOffice: 'Kavaklıdere',
  },

  'Başkent Mobilya': {
    city: 'Ankara',
    district: 'Siteler',
    taxOffice: 'Altındağ',
  },

  'Güven Makine Sanayi': {
    city: 'Ankara',
    district: 'Sincan',
    taxOffice: 'Sincan',
  },

  'Akdeniz Turizm A.Ş.': {
    city: 'Antalya',
    district: 'Muratpaşa',
    taxOffice: 'Muratpaşa',
  },

  'Marmara Kimya Ltd.': {
    city: 'Kocaeli',
    district: 'Gebze',
    taxOffice: 'Gebze',
  },

  'Atlas Medikal': {
    city: 'Ankara',
    district: 'Keçiören',
    taxOffice: 'Keçiören',
  },

  'Nova Teknoloji A.Ş.': {
    city: 'İstanbul',
    district: 'Şişli',
    taxOffice: 'Şişli',
  },

  'Pera Danışmanlık': {
    city: 'İstanbul',
    district: 'Beyoğlu',
    taxOffice: 'Beyoğlu',
  },

  'İnci Gıda Ltd.': {
    city: 'Bursa',
    district: 'Nilüfer',
    taxOffice: 'Nilüfer',
  },
};

const products = [
  {
    id: 'product-1',
    name: '3D Baskı Ürünü',
    description: 'Özel üretim 3D baskı ürün',
    unit: 'piece',
  },
  {
    id: 'product-2',
    name: 'Filament',
    description: '3D yazıcı filament ürünü',
    unit: 'kg',
  },
  {
    id: 'product-3',
    name: 'Tasarım Hizmeti',
    description: '3D modelleme ve tasarım hizmeti',
    unit: 'hour',
  },
  {
    id: 'product-4',
    name: 'Kargo Hizmeti',
    description: 'Ürün gönderim hizmeti',
    unit: 'piece',
  },
];

function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function createEttn(id) {
  const value = String(id).padStart(12, '0');

  return `550e8400-e29b-41d4-a716-${value}`;
}

function getInvoiceParts(invoiceNumber) {
  const parts = invoiceNumber.split('-');

  return {
    series: parts[0] ?? 'FTR',
    number: parts.slice(1).join('-'),
  };
}

function createCustomer(invoice, index) {
  const profile = customerProfiles[invoice.customerName] ?? {
    city: 'Ankara',
    district: 'Çankaya',
    taxOffice: 'Çankaya',
  };

  const customerNumber = String((index % 16) + 1).padStart(3, '0');

  const taxNumber = String(1000000000 + (((index + 1) * 7919) % 8999999999)).slice(0, 10);

  return {
    id: `CARI-${customerNumber}`,

    name: invoice.customerName,

    titleName: invoice.customerName,

    taxNumber,

    taxOfficeCode: String(1000 + (index % 8000)),

    taxOfficeName: profile.taxOffice,

    phone: `0312 555 ${String(10 + (index % 89)).padStart(2, '0')} ${String(
      10 + ((index * 7) % 89),
    ).padStart(2, '0')}`,

    email: `muhasebe${(index % 16) + 1}@example.com`,

    address: {
      addressName: 'Merkez Adres',

      country: 'Türkiye',

      city: profile.city,

      district: profile.district,

      neighborhood: `${profile.district} Merkez Mahallesi`,

      avenue: 'Atatürk Caddesi',

      street: `${(index % 20) + 1}. Sokak`,

      buildingNumber: String((index % 80) + 1),

      apartmentNumber: String((index % 12) + 1),

      postalCode: String(6000 + (index % 9000)).padStart(5, '0'),

      addressCode: `ADR-${String(index + 1).padStart(6, '0')}`,

      additionalDescription: 'Fatura ve teslimat adresidir.',
    },
  };
}

function createItems(invoice, index) {
  const currency = 'TRY';

  const firstProduct = products[index % products.length];

  const secondProduct = products[(index + 1) % products.length];

  const firstTarget = round(invoice.amount * 0.65);

  const secondTarget = round(invoice.amount - firstTarget);

  const firstPrice = round(firstTarget / 1.2);

  const secondPrice = round(secondTarget / 1.2);

  const firstTotal = round(firstPrice * 1.2);

  const secondTotal = round(invoice.amount - firstTotal);

  return [
    {
      id: `ITEM-${invoice.id}-1`,

      type: firstProduct.id === 'product-3' ? 'service' : 'product',

      productId: firstProduct.id,
      productName: firstProduct.name,

      description: firstProduct.description,

      quantity: 1,
      unit: firstProduct.unit,

      unitPrice: firstPrice,

      discountRate: 0,
      vatRate: 20,

      currency,

      lineTotal: firstTotal,
    },

    {
      id: `ITEM-${invoice.id}-2`,

      type:
        secondProduct.id === 'product-3' || secondProduct.id === 'product-4'
          ? 'service'
          : 'product',

      productId: secondProduct.id,
      productName: secondProduct.name,

      description: secondProduct.description,

      quantity: 1,
      unit: secondProduct.unit,

      unitPrice: round(secondTotal / 1.2),

      discountRate: 0,
      vatRate: 20,

      currency,

      lineTotal: secondTotal,
    },
  ];
}

function calculateTotals(items, amount) {
  const subtotal = round(items.reduce((total, item) => total + item.quantity * item.unitPrice, 0));

  const totalDiscount = round(
    items.reduce((total, item) => {
      const gross = item.quantity * item.unitPrice;

      return total + gross * (item.discountRate / 100);
    }, 0),
  );

  return {
    subtotal,
    totalDiscount,

    totalVat: round(amount - subtotal + totalDiscount),

    grandTotal: round(amount),
  };
}

database.invoices = database.invoices.map((invoice, index) => {
  const numericId = Number(invoice.id);

  const normalizedInvoice = {
    ...invoice,
    id: Number.isNaN(numericId) ? index + 1 : numericId,
  };

  const customer = createCustomer(normalizedInvoice, index);

  const invoiceParts = getInvoiceParts(normalizedInvoice.invoiceNumber);

  const items = createItems(normalizedInvoice, index);

  const totals = calculateTotals(items, normalizedInvoice.amount);

  const document = {
    series: invoiceParts.series,

    number: invoiceParts.number,

    description:
      normalizedInvoice.type === 'sale'
        ? 'Mal ve hizmet satış faturası'
        : 'Mal ve hizmet alış faturası',

    dateTime: `${normalizedInvoice.issueDate}T10:00`,

    scenario: index % 4 === 0 ? 'eArchive' : 'eInvoice',

    eType: 'sale',

    currency: 'TRY',

    ettn: createEttn(normalizedInvoice.id),

    cashier: index % 2 === 0 ? 'cashier-1' : 'cashier-2',

    label: index % 5 === 0 ? 'urgent' : 'standard',

    internetSale: index % 3 === 0,

    deliveryReplacement: index % 7 === 0,
  };

  const sourceDocuments =
    index % 3 === 0
      ? [
          {
            id: `SRC-${normalizedInvoice.id}-1`,

            documentType: 'order',

            documentNumber: `SIP-${normalizedInvoice.id}`,

            documentDate: normalizedInvoice.issueDate,

            issuer: normalizedInvoice.customerName,

            ettn: '',

            amount: normalizedInvoice.amount,

            currency: 'TRY',
          },
        ]
      : [];

  return {
    ...normalizedInvoice,

    customer,
    document,

    sourceDocuments,

    items,
    totals,
  };
});

await fs.writeFile(backupUrl, databaseText, 'utf8');

await fs.writeFile(databaseUrl, `${JSON.stringify(database, null, 2)}\n`, 'utf8');

console.log(`${database.invoices.length} fatura zenginleştirildi.`);

console.log('Eski db.json -> mock-api/db.backup.json');
