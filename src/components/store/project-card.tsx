import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Eye } from "lucide-react";

export interface ProjectCardProps {
  slug: string;
  name: string;
  shortDescription?: string | null;
  priceEgp: number | string;
  oldPriceEgp?: number | string | null;
  coverImageUrl?: string | null;
  technologies?: string[];
  demoAvailable?: boolean;
  categoryName?: string | null;
  viewCount?: number;
}

export function ProjectCard({
  slug,
  name,
  shortDescription,
  priceEgp,
  oldPriceEgp,
  coverImageUrl,
  technologies = [],
  demoAvailable,
  categoryName,
  viewCount = 0,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden card-hover border bg-card">
        <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 via-muted to-purple-500/10 relative overflow-hidden">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl font-black text-primary/20 select-none">
                {name.slice(0, 1)}
              </span>
            </div>
          )}
          {demoAvailable && (
            <Badge className="absolute top-3 start-3 rounded-full shadow-md" variant="success">
              Demo
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2 pt-4 px-5">
          {categoryName && (
            <span className="text-xs font-medium text-primary/80 mb-1">{categoryName}</span>
          )}
          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 pb-5">
          {shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{shortDescription}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {technologies.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] rounded-md font-normal">
                {t}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-primary">{formatPrice(Number(priceEgp))}</span>
              {oldPriceEgp && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(Number(oldPriceEgp))}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {viewCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
