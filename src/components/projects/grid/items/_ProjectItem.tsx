import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectData } from "../../types";

export default function ProjectItem({ project }: { project: ProjectData }) {
  const { title, year, summary, tags, contentHtml } = project;
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      onClick={() => setExpanded(!expanded)}
      className={`
        relative cursor-pointer overflow-hidden transition-all
        hover:shadow-lg
        ${expanded ? "ring-2 ring-primary" : ""}
      `}
    >
      {/* Header */}
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-baseline">
          <span className="text-lg font-semibold">{title}</span>
          <span className="text-sm text-muted-foreground">{year}</span>
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent
        className={`
          transition-all duration-300 ease-in-out
          ${expanded ? "max-h-[1000px]" : "max-h-32"}
          space-y-2
        `}
      >
        {/* Summary */}
        <p className="text-sm text-muted-foreground">{summary}</p>

        {/* Category-based tags */}
        {tags &&
          Object.entries(tags).map(([category, tagList]) =>
            tagList && tagList.length ? (
              <div key={category} className="flex flex-wrap gap-1">
                {tagList.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {tagList.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{tagList.length - 5}
                  </span>
                )}
              </div>
            ) : null
          )}

        {/* Expanded content */}
        {expanded && contentHtml && (
          <div
            className="text-sm text-foreground/80 pt-2 border-t border-border"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
      </CardContent>
    </Card>
  );
}
