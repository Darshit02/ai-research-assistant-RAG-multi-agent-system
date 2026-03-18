"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import { logout } from "@/features/auth/authSlice";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldAlert,
  LogOut,
  Bot,
  Cpu,
  Key,
  Loader2,
  Search,
  FileText,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { documentsApi } from "@/shared/api/documents";
import { authApi } from "@/shared/api/auth";
import { toast } from "sonner";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [model, setModel] = useState("gemini-1.5-flash");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await documentsApi.search(searchQuery);
          // @ts-ignore
          setSearchResults(results.data);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      if (user.preferred_model) setModel(user.preferred_model);
      if (user.gemini_api_key && user.gemini_api_key !== "***") setGeminiKey(user.gemini_api_key);
      if (user.openai_api_key && user.openai_api_key !== "***") setOpenaiKey(user.openai_api_key);
      if (user.anthropic_api_key && user.anthropic_api_key !== "***") setAnthropicKey(user.anthropic_api_key);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      dispatch(logout());
      toast.success("Successfully logged out");
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
      dispatch(logout());
      router.push("/");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.updateSettings({
        preferred_model: model,
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
        anthropic_api_key: anthropicKey || undefined,
      });
      toast.success("Settings updated successfully");
      setOpenSettings(false);
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: "Chat", href: "/pages/chat", icon: MessageSquare },
    { name: "Dashboard", href: "/pages/dashboard", icon: LayoutDashboard },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: "Admin", href: "/pages/admin", icon: ShieldAlert });
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar/50 backdrop-blur-md flex flex-col h-screen">
      <div className="p-6">
        <Link href="/pages/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Bot size={20} />
          </div>
          <span className="font-semibold text-lg tracking-tight gradient-heading">
            AI Assistant
          </span>
        </Link>
      </div>

      <div className="px-4 mb-4 relative">
        <div className="relative">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="pl-9 bg-muted/30 border-none rounded-xl h-10 focus-visible:ring-primary/20"
          />
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowResults(false);
              }}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute left-4 right-4 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden glass-card max-h-60 overflow-y-auto custom-scrollbar">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                <Loader2 size={14} className="animate-spin" />
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      router.push(`/pages/chat?docId=${doc.id}`);
                      setShowResults(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left transition-colors"
                  >
                    <FileText size={14} className="text-primary/70" />
                    <span className="text-xs truncate">{doc.filename}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No documents found
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer duration-200 ${isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <item.icon size={18} className={isActive ? "text-primary" : ""} />
              {item.name}
            </Link>
          );
        })}

        <Dialog open={openSettings} onOpenChange={setOpenSettings}>
          <DialogTrigger asChild>
            <button
              className="w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings size={18} />
              Settings
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-border shadow-2xl overflow-hidden glass-card">
            <DialogHeader className="p-6 bg-muted/20 border-b border-border/50">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Settings size={20} />
                </div>
                Platform Settings
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure your global AI preferences and provider API keys.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveSettings} className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  <Cpu size={14} className="text-primary" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Model Library</label>
                </div>
                <div className="space-y-2">
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="flex h-12 w-full rounded-2xl border border-border bg-muted/20 px-4 text-sm focus:ring-2 focus:ring-primary/20 appearance-none transition-all hover:bg-muted/30 outline-none"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 ml-1">
                  <Key size={14} className="text-primary" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gemini API Access</label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="geminiKey" className="text-xs font-bold flex items-center gap-2">API Key</Label>
                    <Input
                      id="geminiKey"
                      type="password"
                      placeholder="Enter Gemini Key"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="rounded-xl bg-muted/20 border-border/50 h-10"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed opacity-60 italic ml-1">
                  Leave blank to use environment defaults.
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl gap-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </nav>

      <div className="p-4 mt-auto border-t border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-medium truncate">
              {user?.email || "user@example.com"}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {user?.role || "USER"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
