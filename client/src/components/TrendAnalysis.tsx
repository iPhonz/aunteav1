import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WordCloud } from "./WordCloud";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Trend = {
  id: number;
  type: "phrase" | "person";
  content: string;
  frequency: number;
  context: any;
};

export function TrendAnalysis() {
  const { data: trends, isLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  if (isLoading) {
    return <div>Loading trends...</div>;
  }

  const phrases = trends?.filter((t) => t.type === "phrase") || [];
  const people = trends?.filter((t) => t.type === "person") || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <WordCloud words={trends?.map((t) => ({ text: t.content, value: t.frequency }))} />
        </CardContent>
      </Card>

      <Tabs defaultValue="phrases">
        <TabsList>
          <TabsTrigger value="phrases">Key Phrases</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>

        <TabsContent value="phrases">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {phrases.map((trend) => (
                  <li key={trend.id} className="flex justify-between items-center">
                    <span>{trend.content}</span>
                    <span className="text-muted-foreground">{trend.frequency}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {people.map((trend) => (
                  <li key={trend.id} className="flex justify-between items-center">
                    <span>{trend.content}</span>
                    <span className="text-muted-foreground">{trend.frequency}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
