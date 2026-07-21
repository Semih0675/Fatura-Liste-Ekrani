import { useEffect, useState } from "react";
import "./App.css";
import { Header } from "./components/Header";
import {
  InvoiceTable,
  type PlaceholderRow,
  type TableColumn,
} from "./components/InvoiceTable";

const invoiceColumns: TableColumn[] = [
  {
    id: "invoice-number",
    label: "Fatura No",
  },
  {
    id: "customer",
    label: "Müşteri",
  },
  {
    id: "issue-date",
    label: "Düzenleme Tarihi",
  },
  {
    id: "due-date",
    label: "Vade Tarihi",
  },
  {
    id: "amount",
    label: "Tutar",
  },
  {
    id: "type",
    label: "Tip",
  },
  {
    id: "status",
    label: "Durum",
  },
];

const placeholderRows: PlaceholderRow[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: `placeholder-row-${index + 1}`,
  }),
);

export default function App() {
  const [isTableVisible, setIsTableVisible] = useState(true);

  useEffect(() => {
    document.title = isTableVisible
      ? "PreAccounting | Fatura Listesi"
      : "PreAccounting | Tablo Gizli";
  }, [isTableVisible]);

  function handleToggleTable() {
    setIsTableVisible((currentValue) => !currentValue);
  }

  return (
    <div className="app">
      <Header
        appName="PreAccounting"
        pageName="Fatura Listesi"
        isTableVisible={isTableVisible}
        onToggleTable={handleToggleTable}
      />

      <main className="page-content">
        <section className="page-intro">
          <div>
            <p className="eyebrow">Fatura yönetimi</p>
            <h1>Fatura Listesi</h1>
            <p className="page-description">
              Faturalarınızı görüntüleyebileceğiniz sayfanın temel React
              iskeleti.
            </p>
          </div>

          <button className="primary-button" type="button">
            + Yeni Fatura
          </button>
        </section>

        {isTableVisible ? (
          <InvoiceTable columns={invoiceColumns} rows={placeholderRows} />
        ) : (
          <section className="empty-state">
            <h2>Tablo gizlendi</h2>
            <p>Fatura tablosunu tekrar görüntülemek için üstteki butona bas.</p>
          </section>
        )}
      </main>
    </div>
  );
}
