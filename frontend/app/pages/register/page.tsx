"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import Link from "next/link";
import { authApi } from "@/shared/api/auth";
import { toast } from "sonner";
import { Badge, BrainCircuit, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      await authApi.register(email, password);
      toast.success("Account created! Please log in.");
      router.push("/pages/login");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-primary ">
            <div
              className="flex flex-col justify-center items-center gap-2 font-bold text-xl text-gray-950 tracking-tighter"
            >
              <div className="rounded-lg text-primary flex  items-center justify-center ">
                <Badge size={40} />
              </div>
              <div className="text-2xl">
                RESEARCHLY
              </div>
            </div>
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8 space-y-6 animate-[slide-up_0.5s_ease-out]">

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Get started with the AI Research Assistant
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-border/50 focus:bg-background h-10 ring-0 focus:ring-0"

              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-border/50 focus:bg-background h-10 ring-0 focus:ring-0"

                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-medium cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/pages/login" className="text-primary hover:underline font-medium transition-colors">
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}