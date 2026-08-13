import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Evaluation = lazy(() => import("./pages/Evaluation"));
const Exercises = lazy(() => import("./pages/Exercises"));
const Home = lazy(() => import("./pages/Home"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/evaluation"} component={Evaluation} />
      <Route path={"/exercises"} component={Exercises} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <DashboardLayout>
          <Suspense
            fallback={
              <main
                className="flex min-h-screen items-center justify-center"
                aria-busy="true"
                aria-live="polite"
              >
                Loading MIRAGE workspace…
              </main>
            }
          >
            <Router />
          </Suspense>
        </DashboardLayout>
        <Toaster theme="dark" richColors />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
