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
  Badge,
  ShieldUser,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { documentsApi } from "@/shared/api/documents";
import { authApi } from "@/shared/api/auth";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

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

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }

  const navItems: NavItem[] = [
    {
      name: "Chats",
      href: "/pages/chat",
      icon: (props) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path
            d="M17.98 10.79V14.79C17.98 15.05 17.97 15.3 17.94 15.54C17.71 18.24 16.12 19.58 13.19 19.58H12.79C12.54 19.58 12.3 19.7 12.15 19.9L10.95 21.5C10.42 22.21 9.56 22.21 9.03 21.5L7.82999 19.9C7.69999 19.73 7.41 19.58 7.19 19.58H6.79001C3.60001 19.58 2 18.79 2 14.79V10.79C2 7.86001 3.35001 6.27001 6.04001 6.04001C6.28001 6.01001 6.53001 6 6.79001 6H13.19C16.38 6 17.98 7.60001 17.98 10.79Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21.98 6.79001V10.79C21.98 13.73 20.63 15.31 17.94 15.54C17.97 15.3 17.98 15.05 17.98 14.79V10.79C17.98 7.60001 16.38 6 13.19 6H6.79004C6.53004 6 6.28004 6.01001 6.04004 6.04001C6.27004 3.35001 7.86004 2 10.79 2H17.19C20.38 2 21.98 3.60001 21.98 6.79001Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.4955 13.25H13.5045"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.9955 13.25H10.0045"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.4955 13.25H6.5045"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Dashboard", href: "/pages/dashboard", icon: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10 2V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10 8.5H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10 15.5H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    },
  ];

  if (user?.role === "admin") {
    navItems.push({
      name: "Admin", href: "/pages/admin", icon: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.48003 18.15C3.51003 17.59 2.91003 16.55 2.91003 15.42V8.58003C2.91003 7.46003 3.51003 6.41999 4.48003 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12 11.0001C13.2869 11.0001 14.33 9.95687 14.33 8.67004C14.33 7.38322 13.2869 6.34009 12 6.34009C10.7132 6.34009 9.67004 7.38322 9.67004 8.67004C9.67004 9.95687 10.7132 11.0001 12 11.0001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M16 16.6601C16 14.8601 14.21 13.4001 12 13.4001C9.79 13.4001 8 14.8601 8 16.6601" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    });
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar/50 backdrop-blur-md flex flex-col h-screen">
      <div className="px-6 py-4">
        <Link href="/pages/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary">
            <Badge size={30} />
          </div>
          <span className="font-semibold text-lg tracking-tight gradient-heading">
            RESEARCHLY
          </span>
        </Link>
      </div>
      <Separator />
      <div className="px-4 my-4 relative">
        <div className="relative">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="pl-9 bg-muted/30 rounded-md h-10 focus-visible:ring-0"
          />
          <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowResults(false);
              }}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute left-4 right-4 mt-2 bg-background border border-border rounded-xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
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
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer duration-200 ${isActive
                ? "bg-primary/10 text-primary font-medium border border-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Icon size={18} className={isActive ? "text-primary" : ""} />
              {item.name}
            </Link>
          );
        })}

        <Dialog open={openSettings} onOpenChange={setOpenSettings}>
          <DialogTrigger asChild>
            <button
              className="w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 12.8799V11.1199C2 10.0799 2.85 9.21994 3.9 9.21994C5.71 9.21994 6.45 7.93994 5.54 6.36994C5.02 5.46994 5.33 4.29994 6.24 3.77994L7.97 2.78994C8.76 2.31994 9.78 2.59994 10.25 3.38994L10.36 3.57994C11.26 5.14994 12.74 5.14994 13.65 3.57994L13.76 3.38994C14.23 2.59994 15.25 2.31994 16.04 2.78994L17.77 3.77994C18.68 4.29994 18.99 5.46994 18.47 6.36994C17.56 7.93994 18.3 9.21994 20.11 9.21994C21.15 9.21994 22.01 10.0699 22.01 11.1199V12.8799C22.01 13.9199 21.16 14.7799 20.11 14.7799C18.3 14.7799 17.56 16.0599 18.47 17.6299C18.99 18.5399 18.68 19.6999 17.77 20.2199L16.04 21.2099C15.25 21.6799 14.23 21.3999 13.76 20.6099L13.65 20.4199C12.75 18.8499 11.27 18.8499 10.36 20.4199L10.25 20.6099C9.78 21.3999 8.76 21.6799 7.97 21.2099L6.24 20.2199C5.33 19.6999 5.02 18.5299 5.54 17.6299C6.45 16.0599 5.71 14.7799 3.9 14.7799C2.85 14.7799 2 13.9199 2 12.8799Z" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Settings
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rouneded-md border-border shadow-2xl overflow-hidden">
            <DialogHeader className="p-6 bg-muted/20 border-b border-border/50">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                Platform Settings
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure your global AI preferences and provider API keys.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveSettings} className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu size={20} className="text-primary" />
                  <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Default Model Library</label>
                </div>
                <div className="space-y-2">
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-muted/20 px-4 text-sm appearance-auto focus:ring-0 transition-all hover:bg-muted/30 outline-none"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center  gap-2 ">
                  <span className="text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M16.28 13.61C15.15 14.74 13.53 15.09 12.1 14.64L9.51001 17.22C9.33001 17.41 8.96001 17.53 8.69001 17.49L7.49001 17.33C7.09001 17.28 6.73001 16.9 6.67001 16.51L6.51001 15.31C6.47001 15.05 6.60001 14.68 6.78001 14.49L9.36001 11.91C8.92001 10.48 9.26001 8.86001 10.39 7.73001C12.01 6.11001 14.65 6.11001 16.28 7.73001C17.9 9.34001 17.9 11.98 16.28 13.61Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M10.45 16.28L9.59998 15.42" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M13.3945 10.7H13.4035" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <label className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">Gemini API Access</label>
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
                      className="rounded-md focus:ring-0 bg-muted/20 border-border/50 h-10"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed opacity-60 italic ml-1">
                  Leave blank to use environment defaults.
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full h-10 rounded-md gap-2 font-bold cursor-pointer capitalize tracking-widest text-xs ">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </nav>

      <div className="px-2 py-2 mt-auto bg-muted">
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
            className=" text-destructive cursor-pointer transition-colors p-2 rounded-md bg-destructive/10"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
