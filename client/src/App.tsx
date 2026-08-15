import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardAccess from "./pages/DashboardAccess";
import LandingPreview from "./pages/LandingPreview";
import PublicHome from "./pages/PublicHome";
import { RegisterPage, SignInPage } from "./pages/AccountAccess";
import ProfileSettings from "./pages/ProfileSettings";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={PublicHome} />
      <Route path={"/dashboard"} component={DashboardAccess} />
      <Route path={"/sign-in"} component={SignInPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/settings"} component={ProfileSettings} />
      <Route path={"/landing-preview"} component={LandingPreview} />
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
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
