import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isBootstrapping } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignup = async (email: string, password: string) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await signup(email, password);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Account"
      title="Create account"
      description="Set up your account to get started."
    >
      <AuthForm mode="signup" isSubmitting={isSubmitting} serverError={error} onSubmit={handleSignup} />
    </AuthCard>
  );
}
