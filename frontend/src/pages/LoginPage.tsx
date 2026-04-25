import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isBootstrapping } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Account"
      title="Sign in"
      description="Enter your email and password to continue."
    >
      <AuthForm mode="login" isSubmitting={isSubmitting} serverError={error} onSubmit={handleLogin} />
    </AuthCard>
  );
}
