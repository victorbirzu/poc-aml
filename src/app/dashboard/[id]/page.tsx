"use client";

import { useEffect, useState, use } from "react";
import ReactMarkdown from "react-markdown";
import type { AmlReport } from "@/lib/types";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import SummaryCards from "@/components/dashboard/summary-cards";
import NarrativeSummaryCard from "@/components/dashboard/narrative-summary-card";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JsonDisplay from "@/components/dashboard/json-display";
import LexisNexisDisplay from "@/components/dashboard/lexis-nexis-display";

export default function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [apiContent, setApiContent] = useState<string | null>(null);
  const [dashboard2Content, setDashboard2Content] = useState<string | null>(
    null
  );
  const [dashboard4Data, setDashboard4Data] = useState<any>(null);
  const [dashboard1Data, setDashboard1Data] = useState<AmlReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id === "1") {
      const storedData = sessionStorage.getItem("dashboard1Response");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          // The response should have the same structure as AmlReport
          setDashboard1Data({ output: parsedData } as AmlReport);
        } catch (e) {
          console.error(
            "Failed to parse dashboard 1 response from sessionStorage",
            e
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } else if (id === "2") {
      const storedData = sessionStorage.getItem("dashboard2Response");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          // Extract markdown content if it exists, otherwise use the data as-is
          let content: string;
          if (typeof parsedData === "string") {
            content = parsedData;
          } else if (
            parsedData?.markdown ||
            parsedData?.content ||
            parsedData?.text
          ) {
            content =
              parsedData.markdown || parsedData.content || parsedData.text;
          } else if (
            parsedData?.output?.markdown ||
            parsedData?.output?.content
          ) {
            content = parsedData.output.markdown || parsedData.output.content;
          } else {
            // If no markdown field found, try to stringify nicely
            content = JSON.stringify(parsedData, null, 2);
          }
          setDashboard2Content(content);
        } catch (e) {
          console.error(
            "Failed to parse dashboard 2 response from sessionStorage",
            e
          );
          setDashboard2Content("Error loading data.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setDashboard2Content("No data received from the API call.");
        setIsLoading(false);
      }
    } else if (id === "3") {
      const storedData = sessionStorage.getItem("apiResponse");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          // Extract markdown content if it exists, otherwise use the data as-is
          let content: string;
          if (typeof parsedData === "string") {
            content = parsedData;
          } else if (
            parsedData?.markdown ||
            parsedData?.content ||
            parsedData?.text
          ) {
            content =
              parsedData.markdown || parsedData.content || parsedData.text;
          } else if (
            parsedData?.output?.markdown ||
            parsedData?.output?.content
          ) {
            content = parsedData.output.markdown || parsedData.output.content;
          } else {
            // If no markdown field found, try to stringify nicely
            content = JSON.stringify(parsedData, null, 2);
          }
          setApiContent(content);
        } catch (e) {
          console.error("Failed to parse API response from sessionStorage", e);
          setApiContent("Error loading data.");
        }
      } else {
        setApiContent("No data received from the API call.");
      }
    } else if (id === "4") {
      const storedData = sessionStorage.getItem("dashboard4Response");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          // Handle array response structure: [{ output: {...} }]
          if (
            Array.isArray(parsedData) &&
            parsedData.length > 0 &&
            parsedData[0].output
          ) {
            setDashboard4Data(parsedData[0].output);
          } else if (parsedData.output) {
            // Handle single object with output property
            setDashboard4Data(parsedData.output);
          } else {
            // Fallback: use the data as-is
            setDashboard4Data(parsedData);
          }
        } catch (e) {
          console.error(
            "Failed to parse dashboard 4 response from sessionStorage",
            e
          );
          setDashboard4Data(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setDashboard4Data(null);
        setIsLoading(false);
      }
    }
  }, [id]);

  if (id === "3") {
    return (
      <DashboardLayout>
        <div className="animate-slide-in space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reputational & Adverse Media</CardTitle>
            </CardHeader>
            <CardContent>
              {apiContent ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{apiContent}</ReactMarkdown>
                </div>
              ) : (
                <p>Loading content...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (id === "1") {
    if (isLoading) {
      return (
        <DashboardLayout>
          <div className="flex h-full items-center justify-center">
            <p>Loading data...</p>
          </div>
        </DashboardLayout>
      );
    }

    if (!dashboard1Data) {
      return (
        <DashboardLayout>
          <div className="flex h-full items-center justify-center">
            <p>No data available. Please perform a search first.</p>
          </div>
        </DashboardLayout>
      );
    }

    const report = dashboard1Data;
    const cases = report?.output?.aggregated_report?.cases || [];
    const hasCases = Array.isArray(cases) && cases.length > 0;

    return (
      <DashboardLayout>
        <div className="animate-slide-in space-y-4 md:space-y-6">
          
          {hasCases ? (
            <>
            <SummaryCards
            header={report.output.aggregated_report.header}
            subject={report.output.searched_subject}
          />
          <NarrativeSummaryCard
            summary={report.output.aggregated_report.narrative_summary}
          />
            <TransactionsTable
              data={cases}
              report={report.output}
            />
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Case History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No data found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (id === "2") {
    return (
      <DashboardLayout>
        <div className="animate-slide-in space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Screening</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard2Content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{dashboard2Content}</ReactMarkdown>
                </div>
              ) : (
                <p>Loading content...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (id === "4") {
    return (
      <DashboardLayout>
        <div className="animate-slide-in space-y-4 md:space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p>Loading content...</p>
              </CardContent>
            </Card>
          ) : dashboard4Data ? (
            <LexisNexisDisplay data={dashboard4Data} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Lexis Nexis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No data available. Please perform a search first.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // For other IDs, show message that data is not available
  return (
    <DashboardLayout>
      <div className="animate-slide-in space-y-4 md:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard for ID: {id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No data available for this ID. Please perform a search first.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
