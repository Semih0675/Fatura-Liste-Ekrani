import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AppLayout from './layouts/AppLayout/AppLayout';

import CreateInvoicePage from './pages/CreateInvoicePage/CreateInvoicePage';

import CustomerListPage from './pages/CustomerListPage/CustomerListPage';

import InvoiceListPage from './pages/InvoiceListPage/InvoiceListPage';

import ProductListPage from './pages/ProductListPage/ProductListPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <InvoiceListPage />
          }
        />

        <Route
          path="invoices/new"
          element={
            <CreateInvoicePage />
          }
        />

        <Route
          path="customers"
          element={
            <CustomerListPage />
          }
        />

        <Route
          path="products"
          element={
            <ProductListPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}