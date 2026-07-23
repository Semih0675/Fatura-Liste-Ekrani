# PreAccounting Invoice List Sandbox

PreAccounting Client projesindeki teknoloji yığını ve kod kalıplarını öğrenmek
amacıyla geliştirilmiş React ve TypeScript fatura listeleme uygulamasıdır.

Proje, ana uygulamadan bağımsız bir sandbox repository olarak hazırlanmıştır.

## Özellikler

- JSON Server üzerinden sahte REST API
- API loading, success ve error durumları
- Tekrar deneme işlemi
- Redux Toolkit ile merkezi state yönetimi
- Typed Redux hooks
- Formik ve Yup ile filtre formu
- React Select ile tekli ve çoklu seçim
- React Datepicker ile tarih aralığı
- Metin, tip, durum, tarih ve tutar filtreleri
- Kolon bazlı artan ve azalan sıralama
- Sayfalama ve sayfa boyutu seçimi
- Filtre sonuçlarına göre hesaplanan özet kartları
- React Modal ile fatura detay ekranı
- Türkçe para ve tarih formatlama
- SCSS Modules ve classnames
- Responsive tasarım
- ESLint ve Prettier kalite kontrolleri

## Teknoloji Yığını

- Node.js 24
- npm
- React 18
- TypeScript 5
- Vite 5
- Redux Toolkit
- React Redux
- Axios
- JSON Server
- Formik
- Yup
- React Select
- React Datepicker
- React Modal
- Sass / SCSS Modules
- classnames
- ESLint
- Prettier

## Proje Yapısı

```text
src
├─ api
│  ├─ http.ts
│  └─ resources
│     └─ invoice.ts
├─ components
│  ├─ ApiErrorState.tsx
│  ├─ EmptyInvoiceState.tsx
│  ├─ FilterForm.tsx
│  ├─ Header.tsx
│  ├─ InvoiceDetailModal.tsx
│  ├─ InvoiceTable.tsx
│  ├─ LoadingSpinner.tsx
│  ├─ Pagination.tsx
│  └─ SummaryCards.tsx
├─ constants
│  └─ invoiceLabels.ts
├─ data
│  └─ invoices.json
├─ models
│  └─ invoice.ts
├─ store
│  ├─ hooks.ts
│  ├─ index.ts
│  ├─ selectors
│  │  └─ invoiceSelectors.ts
│  └─ slices
│     └─ invoiceSlice.ts
├─ styles
│  └─ _variables.scss
├─ utils
│  └─ formatters.ts
├─ App.tsx
└─ main.tsx
```

## Kurulum

Bağımlılıkları yükleyin:

```bash
npm install
```

Ortam değişkeni:

```env
VITE_API_URL=http://localhost:3001
```

## Çalıştırma

Uygulama için iki terminal gerekir.

### Terminal 1 — Sahte API

```bash
npm run api
```

API adresi:

```text
http://localhost:3001/invoices
```

### Terminal 2 — React uygulaması

```bash
npm run dev
```

Uygulama adresi:

```text
http://localhost:5173
```

## Kalite Kontrolleri

Kodları biçimlendirmek:

```bash
npm run format
```

API seed, format, lint ve production build kontrolü:

```bash
npm run verify
```

## API Akışı

```text
JSON Server
    ↓
api/http.ts
    ↓
api/resources/invoice.ts
    ↓
fetchInvoices async thunk
    ↓
invoiceSlice
    ↓
Memoized selector'lar
    ↓
React bileşenleri
```

## Redux İçinde Tutulan Veriler

- Fatura listesi
- API istek durumu
- API hata mesajı
- Aktif filtreler
- Aktif sıralama
- Geçerli sayfa
- Sayfa boyutu

Seçili fatura ve tablonun görünürlük durumu yalnızca ekranı ilgilendirdiği
için yerel React state'inde tutulur.

## Kenar Durumları

- API yükleniyor
- API bağlantı hatası
- Tekrar deneme
- API'nin boş dizi döndürmesi
- Filtrenin sonuç bulamaması
- Geçersiz tarih aralığı
- Geçersiz tutar aralığı
- Son sayfadaki eksik kayıt sayısı
- Filtre ve sıralamada ilk sayfaya dönme
- Modalın Escape ve overlay ile kapatılması

## Bilinen Sınırlamalar

- Gerçek backend yerine JSON Server kullanılır.
- Filtreleme, sıralama ve sayfalama istemci tarafında yapılır.
- Kullanıcı kimlik doğrulaması bulunmaz.
- Fatura oluşturma, güncelleme ve silme işlemleri kapsam dışıdır.
- Otomatik test altyapısı bu eğitim çalışmasına dahil edilmemiştir.
