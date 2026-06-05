import {
  LayoutDashboard,
  Sparkles,
  Boxes,
  Images,
  Wand2,
  Target,
  Megaphone,
  BarChart3,
  Lightbulb,
  Workflow,
  Plug,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "main" | "system";
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard, group: "main", description: "Workspace summary and next actions" },
  { href: "/brand", label: "Brand", icon: Sparkles, group: "main", description: "Brand intelligence and brand book" },
  { href: "/products", label: "Products", icon: Boxes, group: "main", description: "Imported and inspected products" },
  { href: "/assets", label: "Assets", icon: Images, group: "main", description: "Creative asset library" },
  { href: "/creative", label: "Creative Studio", icon: Wand2, group: "main", description: "Concepts, copy, and storyboards" },
  { href: "/strategy", label: "Strategy", icon: Target, group: "main", description: "Advertising brief and strategy plan" },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone, group: "main", description: "Campaign drafts and launches" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, group: "main", description: "Performance across the account" },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb, group: "main", description: "AI analyst suggestions" },
  { href: "/automations", label: "Automations", icon: Workflow, group: "main", description: "Safe, user-defined rules" },
  { href: "/integrations", label: "Integrations", icon: Plug, group: "system", description: "Stores, Meta, and services" },
  { href: "/settings", label: "Settings", icon: Settings, group: "system", description: "Workspace and members" },
];

export const MAIN_NAV = NAV_ITEMS.filter((n) => n.group === "main");
export const SYSTEM_NAV = NAV_ITEMS.filter((n) => n.group === "system");
