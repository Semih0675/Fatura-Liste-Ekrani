import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const invoicesPath = resolve(currentDirectory, '../src/data/invoices.json');

const databasePath = resolve(currentDirectory, '../mock-api/db.json');

const invoicesFile = await readFile(invoicesPath, 'utf8');
const invoices = JSON.parse(invoicesFile);

if (!Array.isArray(invoices)) {
  throw new TypeError('src/data/invoices.json bir fatura dizisi içermelidir.');
}

const database = {
  invoices,
};

await mkdir(dirname(databasePath), {
  recursive: true,
});

await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');

console.log(`${invoices.length} fatura API veritabanına yazıldı.`);
console.log(`Dosya: ${databasePath}`);
