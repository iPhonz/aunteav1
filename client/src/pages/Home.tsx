import { ChatInterface } from "@/components/ChatInterface";
import { NewsFeeds } from "@/components/NewsFeeds";
import { TrendAnalysis } from "@/components/TrendAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">NewsAI Analysis</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat Analysis</TabsTrigger>
            <TabsTrigger value="feeds">News Feeds</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="feeds" className="space-y-4">
            <NewsFeeds />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendAnalysis />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
