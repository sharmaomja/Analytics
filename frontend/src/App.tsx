import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./pages/UploadPage";

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Workspace</p>
            <h2 className="mt-6 max-w-xl text-5xl font-semibold leading-tight text-slate-900">
              Sign in to manage your data.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-600">
              Access your account, upload files, and manage datasets from one place.
            </p>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignupPage />
            </AuthLayout>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
