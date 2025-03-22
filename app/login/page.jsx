
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    
    try {
      await login(data.email, data.password);
      router.push("/channels/@me");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-discord-400 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-discord-300 p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome back!</h2>
          <p className="mt-2 text-gray-400">We're so excited to see you again!</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-discord-400 border-none"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="bg-discord-400 border-none"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="text-xs text-blue-500 hover:underline">
            <Link href="/forgot-password">Forgot your password?</Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-discord-100 hover:bg-discord-100/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>

          <div className="text-center text-sm text-gray-400">
            Need an account?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
