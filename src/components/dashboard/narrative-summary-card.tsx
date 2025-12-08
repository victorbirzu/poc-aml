'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { BookText } from 'lucide-react';

interface NarrativeSummaryCardProps {
  summary: string;
}

export default function NarrativeSummaryCard({
  summary,
}: NarrativeSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookText className="text-primary" />
          Narrative Summary
        </CardTitle>
        <CardDescription>
          An overview of the subject's litigation history and risk profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base text-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
