"use client";

import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ArrowRight, BrainCircuit, FileSearch, LineChart } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "./provider/store";

export default function LandingPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-xl bg-background/60 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <BrainCircuit size={20} />
            </div>
            AI Assistant
          </div>
          <div className="flex gap-4">
            {user ? (
              <Link href="/pages/dashboard">
                <Button className="font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/pages/login">
                  <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                <Link href="/pages/register">
                  <Button className="font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-[fade-in_1s_ease-out]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Powered by Gemini 2.5 Flash
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 animate-[slide-up_0.8s_ease-out]">
          Unlock insights from your <br className="hidden md:block" />
          <span className="gradient-heading">research documents.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-[slide-up_1s_ease-out]">
          Upload your PDFs, ask complex questions, and get precise, cited answers instantly. The ultimate RAG-powered workspace for researchers and professionals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-[slide-up_1.2s_ease-out]">
          <Link href={user ? "/pages/dashboard" : "/pages/register"}>
            <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-xl shadow-primary/25 rounded-xl gap-2 w-full sm:w-auto">
              {user ? "Continue Researching" : "Start Researching Free"} <ArrowRight size={18} />
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 w-full mt-32 animate-[fade-in_1.5s_ease-out]">
          
          <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <FileSearch size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Document RAG</h3>
            <p className="text-muted-foreground leading-relaxed">
              Query across multiple PDFs simultaneously to synthesize information and find connections instantly.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-6">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Advanced Models</h3>
            <p className="text-muted-foreground leading-relaxed">
              Choose your preferred LLM. Powered by state-of-the-art embedding models and cross-encoder rerankers.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <LineChart size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Usage Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Track your queries, document processing status, and token usage through the built-in dashboard.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}