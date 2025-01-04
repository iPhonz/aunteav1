import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type NewsArticle = {
  id: number;
  title: string;
  content: string;
  source: string;
  publishDate: string;
  url: string;
};

export function NewsFeeds() {
  const { data: articles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  if (isLoading) {
    return <div>Loading news feeds...</div>;
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {articles?.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {article.source} • {new Date(article.publishDate).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3">{article.content}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Read more
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
