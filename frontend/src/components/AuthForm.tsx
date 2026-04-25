import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { validateAuthForm } from "../utils/validators";

type AuthFormProps = {
  mode: "login" | "signup";
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function AuthForm({ mode, isSubmitting, serverError, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateAuthForm(email, password);

    if (validationError) {
      setClientError(validationError);
      return;
    }

    setClientError(null);
    await onSubmit(email.trim().toLowerCase(), password);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor={`${mode}-email`}>
          Email
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor={`${mode}-password`}>
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={password}
          onChange={event => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
          placeholder="Minimum 8 characters"
        />
      </div>

      {(clientError || serverError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {clientError ?? serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Please wait..." : isLogin ? "Log in" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {isLogin ? "Need an account?" : "Already have an account?"} {" "}
        <Link className="font-semibold text-slate-900 hover:text-slate-700" to={isLogin ? "/signup" : "/login"}>
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
