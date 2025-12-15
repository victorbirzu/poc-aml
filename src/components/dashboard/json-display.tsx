"use client";

import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JsonDisplayProps {
  data: any;
  title?: string;
}

function formatValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  }

  if (typeof value === "number") {
    return <span className="font-mono font-semibold">{value}</span>;
  }

  if (typeof value === "string") {
    // Check if it's a date string
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return (
            <span className="text-sm">
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          );
        }
      } catch {
        // Not a valid date, continue
      }
    }
    return <span className="text-sm">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="text-muted-foreground italic text-sm">
          Empty array
        </span>
      );
    }
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="pl-4 border-l-2 border-border">
            {typeof item === "object" && item !== null ? (
              <JsonObjectDisplay data={item} />
            ) : (
              <div className="py-1">{formatValue(item)}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return <JsonObjectDisplay data={value} />;
  }

  return <span className="text-sm">{String(value)}</span>;
}

function JsonObjectDisplay({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <span className="text-muted-foreground italic text-sm">Empty object</span>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="space-y-1">
          <div className="text-sm font-semibold text-foreground/80 capitalize">
            {key
              .replace(/_/g, " ")
              .replace(/([A-Z])/g, " $1")
              .trim()}
            :
          </div>
          <div className="pl-4">{formatValue(value)}</div>
        </div>
      ))}
    </div>
  );
}

export default function JsonDisplay({ data, title }: JsonDisplayProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || "Data"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // If data is already a string (markdown), render it as markdown
  if (typeof data === "string") {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{data}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If data has markdown/content/text fields, use those
  if (data.markdown || data.content || data.text) {
    const content = data.markdown || data.content || data.text;
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If data has nested output with markdown/content
  if (data.output?.markdown || data.output?.content) {
    const content = data.output.markdown || data.output.content;
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Otherwise, render as formatted JSON object
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          <JsonObjectDisplay data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
