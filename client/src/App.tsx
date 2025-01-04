import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
