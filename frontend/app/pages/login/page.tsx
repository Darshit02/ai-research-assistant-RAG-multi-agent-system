"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import Link from "next/link";
import { authApi } from "@/shared/api/auth";
import { setCredentials } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { Badge, BrainCircuit, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      const tokenRes = await authApi.login(email, password);
      const token = tokenRes.data.access_token;
      localStorage.setItem("access_token", token);
      const meRes = await authApi.getMe();

      // 4. Update Redux
      dispatch(
        setCredentials({
          user: meRes.data,
          token,
        })
      );

      toast.success("Welcome back!");
      router.push("/pages/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid email or password");
      localStorage.removeItem("access_token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your research
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-border/50 focus:bg-background h-10"
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
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="text-[#888] text-sm text-center">
            Don't have an account?{" "}
            <Link href="/pages/register" className="text-primary hover:underline font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}