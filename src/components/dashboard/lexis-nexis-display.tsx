"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LexisNexisOutput {
  lexisnexis_raw_response: any;
  subject: {
    subject_type: string;
    requested_names: string[];
    subject_dob: string | null;
    subject_identifier: string | null;
  };
  result: string;
  best_fit_selection: {
    name: string;
    score: {
      best_name_score: number;
      entity_score: number;
    };
    reason_listed: string;
    primary_risk_tags: string[];
    last_updated: string;
    adverse_media_links: string[];
    justification: string;
    confidence: string;
  };
  short_risk_conclusion: string;
  other_high_score_candidates: Array<{
    name: string;
    score: {
      best_name_score: number;
      entity_score: number;
    };
    reason_listed: string;
    primary_risk_tags: string[];
    last_updated: string;
    adverse_media_links: string[];
  }>;
}

interface LexisNexisDisplayProps {
  data: LexisNexisOutput | null;
}

function getConfidenceBadgeVariant(confidence: string) {
  switch (confidence.toLowerCase()) {
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
}

function getRiskTagVariant(tag: string) {
  if (tag.toLowerCase().includes("sanction")) {
    return "destructive";
  }
  if (tag.toLowerCase().includes("adverse")) {
    return "default";
  }
  return "secondary";
}

export default function LexisNexisDisplay({ data }: LexisNexisDisplayProps) {
  if (!data || Array.isArray(data) && !data[0]?.isFound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lexis Nexis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{data[0]?.message || "No data available"}</p>
        </CardContent>
      </Card>
    );
  }

  const {
    subject,
    result,
    best_fit_selection,
    short_risk_conclusion,
    other_high_score_candidates,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Lexis Nexis Screening Results
            </CardTitle>
            <Badge
              variant={result === "RESULTS" ? "default" : "secondary"}
              className="text-sm"
            >
              {result}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subject Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Subject Information
              </h3>
              <div className="space-y-2 pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{subject.subject_type}</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Requested Names:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {subject.requested_names.map((name, idx) => (
                      <Badge key={idx} variant="secondary">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
                {subject.subject_dob && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span className="text-sm">{subject.subject_dob}</span>
                  </div>
                )}
                {subject.subject_identifier && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Identifier:</span>
                    <span className="text-sm">
                      {subject.subject_identifier}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Conclusion Alert */}
      {short_risk_conclusion && (
        <Alert
          variant={
            best_fit_selection.primary_risk_tags.some((tag) =>
              tag.toLowerCase().includes("sanction")
            )
              ? "destructive"
              : "default"
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Risk Conclusion</AlertTitle>
          <AlertDescription className="mt-2">
            {short_risk_conclusion}
          </AlertDescription>
        </Alert>
      )}

      {/* Best Fit Selection */}
      {best_fit_selection && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">Best Match</CardTitle>
                <h3 className="text-lg font-semibold">
                  {best_fit_selection.name}
                </h3>
              </div>
              <Badge
                variant={getConfidenceBadgeVariant(
                  best_fit_selection.confidence
                )}
              >
                {best_fit_selection.confidence} Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Best Name Score
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">
                    {best_fit_selection.score.best_name_score}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Entity Score
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">
                    {best_fit_selection.score.entity_score}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Risk Tags */}
            <div>
              <div className="text-sm font-semibold mb-2">
                Primary Risk Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {best_fit_selection.primary_risk_tags.map((tag, idx) => (
                  <Badge key={idx} variant={getRiskTagVariant(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reason Listed */}
            <div>
              <div className="text-sm font-semibold mb-1">Reason Listed</div>
              <p className="text-sm text-muted-foreground">
                {best_fit_selection.reason_listed}
              </p>
            </div>

            {/* Last Updated */}
            <div>
              <div className="text-sm font-semibold mb-1">Last Updated</div>
              <p className="text-sm text-muted-foreground">
                {new Date(best_fit_selection.last_updated).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>

            {/* Justification */}
            {best_fit_selection.justification && (
              <>
                <Separator />
                <div>
                  <div className="text-sm font-semibold mb-2">
                    Justification
                  </div>
                  <p className="text-sm leading-relaxed">
                    {best_fit_selection.justification}
                  </p>
                </div>
              </>
            )}

            {/* Adverse Media Links */}
            {best_fit_selection.adverse_media_links &&
              best_fit_selection.adverse_media_links.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-semibold mb-2">
                      Adverse Media Links
                    </div>
                    <div className="space-y-2">
                      {best_fit_selection.adverse_media_links.map(
                        (link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-md">{link}</span>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      )}

      {/* Other High Score Candidates */}
      {other_high_score_candidates &&
        other_high_score_candidates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Other High Score Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {other_high_score_candidates.map((candidate, idx) => (
                  <div key={idx}>
                    {idx > 0 && <Separator className="my-4" />}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-lg">
                          {candidate.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Score: {candidate.score.best_name_score}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Best Name Score:
                          </span>
                          <span className="ml-2 font-semibold">
                            {candidate.score.best_name_score}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Entity Score:
                          </span>
                          <span className="ml-2 font-semibold">
                            {candidate.score.entity_score}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-semibold">
                          Reason Listed:
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {candidate.reason_listed}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-semibold">
                          Risk Tags:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {candidate.primary_risk_tags.map((tag, tagIdx) => (
                            <Badge
                              key={tagIdx}
                              variant={getRiskTagVariant(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-semibold">
                          Last Updated:
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(candidate.last_updated).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      {candidate.adverse_media_links &&
                        candidate.adverse_media_links.length > 0 && (
                          <div>
                            <span className="text-sm font-semibold">
                              Adverse Media Links:
                            </span>
                            <div className="space-y-1 mt-1">
                              {candidate.adverse_media_links.map(
                                (link, linkIdx) => (
                                  <a
                                    key={linkIdx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="truncate max-w-md">
                                      {link}
                                    </span>
                                  </a>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
