import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper } from "lucide-react";

type NewsArticle = {
  id: number;
  title: string;
  content: string;
  source: string;
  publishDate: string;
  url: string;
  imageUrl?: string;
};

export function NewsFeeds() {
  const { data: articles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-[600px]">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <Newspaper className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Loading news feeds...</p>
      </div>
    </div>;
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {articles?.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            {article.imageUrl && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {article.source} • {new Date(article.publishDate).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground mb-4">{article.content}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-block text-sm font-medium"
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