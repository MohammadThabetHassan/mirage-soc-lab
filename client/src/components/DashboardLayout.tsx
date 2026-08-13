// MIRAGE console philosophy: a restrained graphite-and-cyan analyst shell that keeps
// navigation legible without loading a generic component framework on every route.
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Activity,
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: LayoutDashboard, label: "Live SOC", path: "/" },
  { icon: BarChart3, label: "Evaluation", path: "/evaluation" },
  { icon: GraduationCap, label: "Exercises", path: "/exercises" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

function NavItems({
  location,
  navigate,
}: {
  location: string;
  navigate: (path: string) => void;
}) {
  return (
    <nav aria-label="SOC workspace" className="px-2 py-3">
      <ul className="space-y-1">
        {menuItems.map(item => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <li key={item.path}>
              <button
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-200"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? Number.parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const stopResizing = () => setIsResizing(false);
    const resizeSidebar = (event: MouseEvent) => {
      if (!isResizing) return;
      const nextWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, event.clientX));
      setSidebarWidth(nextWidth);
    };

    document.addEventListener("mousemove", resizeSidebar);
    document.addEventListener("mouseup", stopResizing);
    return () => {
      document.removeEventListener("mousemove", resizeSidebar);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!isMobile) setMobileNavigationOpen(false);
  }, [isMobile]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        aria-labelledby="sign-in-gate-title"
      >
        <div className="flex w-full max-w-md flex-col items-center gap-8 p-8">
          <div className="flex flex-col items-center gap-6">
            <h1
              id="sign-in-gate-title"
              className="text-center text-2xl font-semibold tracking-tight"
            >
              Sign in to continue
            </h1>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Access to this dashboard requires authentication. Continue to
              launch the login flow.
            </p>
          </div>
          <button
            type="button"
            onClick={startLogin}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:shadow-xl active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  const navigate = (path: string) => {
    setLocation(path);
    setMobileNavigationOpen(false);
  };

  const navigationPanel = (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-cyan-400/10 px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
          <Activity className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <span className="block truncate text-sm font-black tracking-[0.22em] text-cyan-300">
            MIRAGE
          </span>
          <span className="mt-0.5 block text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            SOC LAB
          </span>
        </div>
      </div>
      <NavItems location={location} navigate={navigate} />
      <div className="mt-auto border-t border-cyan-400/10 p-3">
        <div className="mb-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
          <span className="flex items-center gap-2">
            <Activity className="h-3 w-3" aria-hidden="true" /> Local lab active
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-1 py-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name || "-"}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {user.email || "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="relative hidden shrink-0 flex-col border-r border-cyan-400/10 bg-sidebar md:flex"
        style={{ width: sidebarWidth }}
      >
        {navigationPanel}
        <button
          type="button"
          aria-label="Resize navigation"
          onMouseDown={() => setIsResizing(true)}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/30 focus:outline-none focus-visible:bg-primary/40"
        />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b border-cyan-400/10 bg-background/95 px-3 backdrop-blur md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileNavigationOpen}
            onClick={() => setMobileNavigationOpen(true)}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="ml-3 text-sm font-medium">
            {menuItems.find(item => item.path === location)?.label ?? "MIRAGE"}
          </span>
        </header>
        <main className="min-w-0 p-4">{children}</main>
      </div>

      {mobileNavigationOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavigationOpen(false)}
            className="absolute inset-0 bg-black/55"
          />
          <aside className="relative flex h-full w-[min(84vw,19rem)] flex-col bg-sidebar shadow-2xl">
            {navigationPanel}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
