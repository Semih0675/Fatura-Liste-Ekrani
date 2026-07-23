# Final Demo Akışı

## 1. Proje Tanıtımı

- PreAccounting ana projesine hazırlık amacıyla geliştirildi.
- Ana projeden bağımsız bir sandbox uygulamasıdır.
- React, TypeScript ve Redux Toolkit kullanıldı.
- Fatura verileri JSON Server API'sinden alınır.

## 2. API'den Veri Yükleme

- JSON Server çalıştırılır.
- React uygulaması açılır.
- Loading spinner gösterilir.
- GET /invoices isteğinin 200 OK döndüğü gösterilir.
- 128 fatura kaydının Redux store'a yazıldığı açıklanır.

## 3. Özet Kartları

- Filtrelenen toplam fatura adedi
- Filtrelenen toplam tutar
- Gecikmiş fatura tutarı
- Kartların aktif filtre sonuçlarına göre yeniden hesaplandığı gösterilir.

## 4. Filtre Formu

- Fatura numarası veya müşteri adıyla arama
- Satış veya alış tipi seçimi
- Birden fazla durum seçimi
- Başlangıç ve bitiş tarihi
- Minimum ve maksimum tutar
- Filtreleri temizleme

## 5. Form Validasyonu

- Maksimum tutarın minimum tutardan küçük olamayacağı gösterilir.
- Bitiş tarihinin başlangıç tarihinden önce olamayacağı gösterilir.
- Negatif tutar girişinin kabul edilmediği gösterilir.
- Yup hata mesajları açıklanır.

## 6. Kolon Sıralama

- Müşteri kolonunda artan ve azalan sıralama
- Tutar kolonunda sayısal sıralama
- Tarih kolonunda kronolojik sıralama
- Aktif sıralama yönünün ok işaretiyle gösterilmesi

## 7. Sayfalama

- Önceki ve sonraki sayfa butonları
- Numaralı sayfa butonları
- Sayfa başına 10, 20 ve 50 kayıt seçimi
- Filtre veya sıralama değiştiğinde ilk sayfaya dönülmesi

## 8. Fatura Detay Modalı

- Bir faturanın Detay butonuna basılır.
- Fatura numarası, müşteri, tutar, tarihler, tip ve durum gösterilir.
- Modal Kapat butonuyla kapatılır.
- Escape tuşuyla kapatılır.
- Overlay'e tıklayarak kapatılır.

## 9. API Hata Durumu

- JSON Server kapatılır.
- React sayfası yenilenir.
- API hata ekranı gösterilir.
- JSON Server tekrar başlatılır.
- Tekrar Dene butonuyla verilerin yeniden yüklendiği gösterilir.

## 10. Boş Veri Durumu

- API'nin boş bir fatura dizisi döndürmesi test edilir.
- Henüz fatura bulunmuyor ekranı gösterilir.
- Boş API sonucu ile boş filtre sonucunun farklı olduğu açıklanır.

## 11. Kod Gezintisi

İncelenecek temel dosyalar:

- src/App.tsx
- src/api/http.ts
- src/api/resources/invoice.ts
- src/store/index.ts
- src/store/hooks.ts
- src/store/slices/invoiceSlice.ts
- src/store/selectors/invoiceSelectors.ts
- src/components/FilterForm.tsx
- src/components/InvoiceTable.tsx
- src/components/Pagination.tsx
- src/components/InvoiceDetailModal.tsx

## 12. Kalite Kontrolleri

Aşağıdaki komutların başarıyla tamamlandığı gösterilir:

```bash
npm run format
npm run verify
```
