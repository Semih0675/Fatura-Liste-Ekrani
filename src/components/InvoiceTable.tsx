export interface TableColumn {
  id: string;
  label: string;
}

export interface PlaceholderRow {
  id: string;
}

interface InvoiceTableProps {
  columns: TableColumn[];
  rows: PlaceholderRow[];
}

export function InvoiceTable({ columns, rows }: InvoiceTableProps) {
  return (
    <section className="table-card">
      <div className="table-card-header">
        <div>
          <h2>Faturalar</h2>
          <p>Gerçek fatura verileri sonraki adımlarda eklenecek.</p>
        </div>

        <span className="table-badge">Placeholder</span>
      </div>

      <div className="table-scroll">
        <table className="invoice-table">
          <caption className="sr-only">
            Fatura listesi yer tutucu tablosu
          </caption>

          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={`${row.id}-${column.id}`}>
                    <span className="table-placeholder" aria-hidden="true" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
