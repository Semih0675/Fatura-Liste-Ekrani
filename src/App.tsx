import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout/AppLayout';
import CreateInvoicePage from './pages/CreateInvoicePage/CreateInvoicePage';
import InvoiceListPage from './pages/InvoiceListPage/InvoiceListPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<InvoiceListPage />} />

        <Route path="invoices/new" element={<CreateInvoicePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
