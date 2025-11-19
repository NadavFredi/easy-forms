
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./store/store";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard/Dashboard";
import FormBuilder from "./pages/FormBuilder/FormBuilder";
import FormView from "./pages/FormView/FormView";
import Submissions from "./pages/Submissions/Submissions";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import NotFound from "./pages/NotFound";
import { AppFooter } from "./components/layout/AppFooter";

const AppContent = () => (
  <div className="flex min-h-screen flex-col">
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forms/:id/edit" element={<FormBuilder />} />
        <Route path="/forms/:id/submissions" element={<Submissions />} />
        <Route path="/f/:slug" element={<FormView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <AppFooter />
  </div>
);

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </Provider>
);

export default App;
