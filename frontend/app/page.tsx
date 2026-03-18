"use client";

import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowRightCircle, Badge, Brain, BrainCircuit, Check, Dot, FileCheckCorner, FileSearch, LineChart, MessageSquare, MoveRight, Sparkles, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "./provider/store";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] mesh-gradient opacity-30 -z-10 blur-[100px]" />

      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-xl bg-background/60 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 font-bold text-xl text-gray-950 tracking-tighter"
          >
            <div className="w-8 h-8 rounded-lg text-primary flex items-center justify-center ">
              <Badge size={25} />
            </div>
            RESEARCHLY
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            {user ? (
              <Link href="/pages/dashboard">
                <Button className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 rounded-full px-6">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/pages/login">
                  <Button variant="ghost" className="font-medium hover:bg-white/5 transition-colors rounded-md border border-border cursor-pointer px-6">
                    Log in
                  </Button>
                </Link>
                <Link href="/pages/register">
                  <Button className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300  rounded-md cursor-pointer px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8"
          >
            <Dot size={30} className="" />
            <span>AI-Powered Research Intelligence</span>
          </motion.div>

          <motion.h1
            {...fadeInUp}
            className="text-6xl md:text-7xl capitalize font-bold tracking-tight mb-4 leading-[1.1]"
          >
            Precision insights from <br />
            <span className="gradient-heading">complex documents.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-lg text-muted-foreground max-w-2xl mb-12 leading-relaxed"
          >
            Upload your PDFs and let our RAG engine synthesize information, uncover connections, and provide cited answers in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={user ? "/pages/dashboard" : "/pages/register"}>
              <Button size="lg" className="h-14 px-10 text-base font-bold rounded-md gap-2 w-full sm:w-auto cursor-pointer">
                {user ? "Continue Researching" : "Try Researchly Free"} <MoveRight size={20} />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Feature Bento Grid */}
        <section className="mb-40">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Engineered for Excellence</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built with the latest in vector search and Large Language Models.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div
              variants={fadeInUp}
              className="md:col-span-2 glass-card p-10 rounded-3xl group overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <FileCheckCorner size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Multi-Document RAG</h3>
                <p className="text-muted-foreground text-md leading-relaxed ">
                  Don't just query one file. Cross-reference an entire library of PDFs. Our system connects dots between documents to give you the full picture.
                </p>
                <div className="mt-8 flex gap-4 flex-wrap">
                  {['Vector Search', 'Semantic Ranking', 'Citied Answers'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-white/10 border border-border text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI Model */}
            <motion.div
              variants={fadeInUp}
              className="glass-card p-10 rounded-3xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Model Agnostic</h3>
              <p className="text-muted-foreground leading-relaxed text-md">
                Choose between GPT-4o, Gemini 1.5 Pro, or Claude 3.5. We use whatever model fits your research best.
              </p>
            </motion.div>

            {/* Fast Processing */}
            <motion.div
              variants={fadeInUp}
              className="glass-card p-10 rounded-3xl group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <Zap size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Indexing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload massive PDFs and start querying in seconds. High-performance embeddings ensure no wait times.
              </p>
            </motion.div>

            {/* Analytics */}
            <motion.div
              variants={fadeInUp}
              className="md:col-span-2 glass-card p-10 rounded-3xl relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                    <LineChart size={24} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Insights Dashboard</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track your research trends, token usage, and document processing metrics through an intuitive interface.
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Pricing Section */}


        {/* FAQ Section */}
        <section className="mb-40 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Common Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: "How secure are my uploaded documents?", a: "We use enterprise-grade encryption for all data at rest and in transit. Your documents are never used to train base models." },
              { q: "Can I use Researchly on mobile?", a: "Yes, Researchly is fully responsive and works perfectly on all mobile and tablet browsers." },
              { q: "What models power Researchly?", a: "We utilize state-of-the-art models including GPT-4o, Claude 3.5, and Gemini 2.5 Pro, combined with custom-tuned indexing." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl border-white/5"
              >
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.98 10.79V14.79C17.98 15.05 17.97 15.3 17.94 15.54C17.71 18.24 16.12 19.58 13.19 19.58H12.79C12.54 19.58 12.3 19.7 12.15 19.9L10.95 21.5C10.42 22.21 9.56 22.21 9.03 21.5L7.82999 19.9C7.69999 19.73 7.41 19.58 7.19 19.58H6.79001C3.60001 19.58 2 18.79 2 14.79V10.79C2 7.86001 3.35001 6.27001 6.04001 6.04001C6.28001 6.01001 6.53001 6 6.79001 6H13.19C16.38 6 17.98 7.60001 17.98 10.79Z" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M21.98 6.79001V10.79C21.98 13.73 20.63 15.31 17.94 15.54C17.97 15.3 17.98 15.05 17.98 14.79V10.79C17.98 7.60001 16.38 6 13.19 6H6.79004C6.53004 6 6.28004 6.01001 6.04004 6.04001C6.27004 3.35001 7.86004 2 10.79 2H17.19C20.38 2 21.98 3.60001 21.98 6.79001Z" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M13.4955 13.25H13.5045" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M9.9955 13.25H10.0045" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M6.4955 13.25H6.5045" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>

                  {item.q}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-16 rounded-[40px] bg-primary/5 border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
            <h2 className="text-4xl md:text-5xl font-bold mb-3 relative z-10">Start your next research project today.</h2>
            <p className="text-muted-foreground text-lg mb-3 relative z-10">Researchers scaling their insights with Researchly.</p>
            <Link href="/pages/register" className="relative z-10">
              <Button size="lg" className="h-14 px-12 text-base font-bold rounded-md cursor-pointer">
                Get Started for Free
              </Button>
            </Link>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 place-content-center-safe gap-12">
          <div className="col-span-2 md:col-span-2 i">
             <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 font-bold text-xl text-gray-950 tracking-tighter"
          >
            <div className="w-8 h-8 rounded-lg text-primary flex items-center justify-center ">
              <Badge size={25} />
            </div>
            RESEARCHLY
          </motion.div>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering researchers with cutting-edge AI to navigate the world's knowledge.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}