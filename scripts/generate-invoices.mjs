import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const outputPath = resolve(currentDirectory, '../src/data/invoices.json');

const customerNames = [
  'Yılmaz Ticaret A.Ş.',
  'Demir İnşaat Ltd. Şti.',
  'Aksa Gıda San. A.Ş.',
  'Kaya Otomotiv',
  'Öztürk Tekstil Ltd.',
  'Mavi Lojistik A.Ş.',
  'Ege Elektronik',
  'Anadolu Yazılım Ltd.',
  'Başkent Mobilya',
  'Güven Makine Sanayi',
  'Akdeniz Turizm A.Ş.',
  'Marmara Kimya Ltd.',
  'Atlas Medikal',
  'Nova Teknoloji A.Ş.',
  'Pera Danışmanlık',
  'İnci Gıda Ltd.',
];

const recordCount = 10_000;
const firstInvoiceNumber = 1;
const anchorDate = new Date('2026-07-03T00:00:00.000Z');

function addDays(date, numberOfDays) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + numberOfDays);

  return result;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function getStatus(index) {
  if (index % 7 === 3 || index % 11 === 6) {
    return 'overdue';
  }

  if (index % 3 === 1) {
    return 'pending';
  }

  return 'paid';
}

function getType(index) {
  return index % 4 === 2 ? 'purchase' : 'sale';
}

function getAmount(index) {
  const baseAmount = 8450.25;
  const generatedAmount = baseAmount + ((index * 7913.75) % 120000);

  return Number(generatedAmount.toFixed(2));
}

const invoices = Array.from({ length: recordCount }, (_, index) => {
  const invoiceSequence = firstInvoiceNumber + index;
  const issueDate = addDays(anchorDate, -(index % 730));
  const status = getStatus(index);

  const dueDate = status === 'overdue' ? addDays(issueDate, 7) : addDays(issueDate, 30);

  return {
    id: invoiceSequence,
    invoiceNumber: `FTR-2026-${String(invoiceSequence).padStart(5, '0')}`,
    customerName: customerNames[index % customerNames.length],
    issueDate: toIsoDate(issueDate),
    dueDate: toIsoDate(dueDate),
    amount: getAmount(index),
    type: getType(index),
    status,
  };
});

await mkdir(dirname(outputPath), { recursive: true });

await writeFile(outputPath, `${JSON.stringify(invoices, null, 2)}\n`, 'utf8');

console.log(`${invoices.length} fatura oluşturuldu.`);
