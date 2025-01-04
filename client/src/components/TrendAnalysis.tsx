import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WordCloud } from "./WordCloud";

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
          <CardTitle>Trending Topics Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <WordCloud 
            words={trends?.map((t) => ({ 
              text: t.content, 
              value: t.frequency,
              category: t.type 
            }))} 
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Phrases</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {phrases.map((trend) => (
                <li key={trend.id} className="flex justify-between items-center p-2 hover:bg-secondary rounded-lg transition-colors">
                  <span className="font-medium">{trend.content}</span>
                  <span className="text-sm text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                    {trend.frequency}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notable People</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {people.map((trend) => (
                <li key={trend.id} className="flex justify-between items-center p-2 hover:bg-secondary rounded-lg transition-colors">
                  <span className="font-medium">{trend.content}</span>
                  <span className="text-sm text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                    {trend.frequency}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}