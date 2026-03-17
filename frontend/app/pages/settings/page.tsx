"use client";

import { useState } from "react";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { documentsApi } from "@/shared/api/documents";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/provider/store";
import { setCredentials } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { Settings, Save, Key, Cpu, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const [model, setModel] = useState("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await documentsApi.updateSettings(model, apiKey);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-[fade-in_0.5s_ease-out]">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Settings size={28} className="text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your AI preferences and API keys.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-border">
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b border-border pb-2 flex items-center gap-2">
                  <Cpu size={18} className="text-primary" />
                  Model Configuration
                </h3>
                
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="model">Preferred AI Model</Label>
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the model used for answering questions across your documents.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium border-b border-border pb-2 flex items-center gap-2">
                  <Key size={18} className="text-primary" />
                  API Access
                </h3>
                
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="apiKey">Custom API Key (Optional)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to use the system default key. Overriding this will use your own quota.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="gap-2 shadow-md shadow-primary/20"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </Button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
