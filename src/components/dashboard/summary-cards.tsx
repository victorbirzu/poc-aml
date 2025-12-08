'use client';

import type { ReportHeader, SearchedSubject } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  header: ReportHeader;
  subject: SearchedSubject;
}

const riskIconMap = {
  High: <ShieldAlert className="mr-1 h-4 w-4" />,
  Medium: <ShieldHalf className="mr-1 h-4 w-4" />,
  Low: <ShieldCheck className="mr-1 h-4 w-4" />,
};

export default function SummaryCards({ header, subject }: SummaryCardsProps) {
  const riskCardClass =
    header.overall_risk_level === 'High'
      ? 'border-red-500 border-2'
      : header.overall_risk_level === 'Medium'
      ? 'border-yellow-500 border-2'
      : '';

  return (
    <div>
      <div className="mb-4 px-2 sm:px-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          {subject.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Showing report for identifier: {subject.identifier}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(riskCardClass)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk</CardTitle>
            <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              className={cn(
                'flex w-fit items-center px-4 py-2 text-base font-bold',
                {
                  'bg-red-500 text-white': header.overall_risk_level === 'High',
                  'bg-yellow-500 text-black':
                    header.overall_risk_level === 'Medium',
                  'bg-green-500 text-white': header.overall_risk_level === 'Low',
                }
              )}
            >
              {riskIconMap[header.overall_risk_level]}
              <span>{header.overall_risk_level}</span>
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{header.total_cases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Cases</CardTitle>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {header.won_cases_adverse_position}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Cases</CardTitle>
            <TrendingDown className="h-8 w-8 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {header.lost_cases_adverse_position}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
