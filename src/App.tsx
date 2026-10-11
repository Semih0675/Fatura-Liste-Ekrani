import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AppLayout from './layouts/AppLayout/AppLayout';

import DashboardPage from './pages/DashboardPage/DashboardPage';

import CreateInvoicePage from './pages/CreateInvoicePage/CreateInvoicePage';

import CustomerListPage from './pages/CustomerListPage/CustomerListPage';

import InvoiceListPage from './pages/InvoiceListPage/InvoiceListPage';

import ProductListPage from './pages/ProductListPage/ProductListPage';

import PaymentListPage from './pages/PaymentListPage/PaymentListPage';

import ReportsPage from './pages/ReportsPage/ReportsPage';

import CompanySettingsPage from './pages/CompanySettingsPage/CompanySettingsPage';

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
          path="dashboard"
          element={
            <DashboardPage />
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

        <Route
          path="payments"
          element={
            <PaymentListPage />
          }
        />

        <Route
          path="reports"
          element={
            <ReportsPage />
          }
        />

        <Route
          path="settings/company"
          element={
            <CompanySettingsPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}