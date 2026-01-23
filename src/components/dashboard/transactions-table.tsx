'use client';

import * as React from 'react';
import type { Case, AmlReportOutput } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ChevronRight, Flag, Briefcase } from 'lucide-react';
import { TransactionDetailSheet } from './transaction-detail-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionsTableProps {
  data: Case[];
  report: AmlReportOutput;
}

type SortKey = 'decision_date' | 'case_topic';
type SortDirection = 'asc' | 'desc';

export function TransactionsTable({ data, report }: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [outcomeFilter, setOutcomeFilter] = React.useState('all');
  const [sortKey, setSortKey] = React.useState<SortKey>('decision_date');
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>('desc');
  const [selectedCase, setSelectedCase] = React.useState<Case | null>(null);

  const filteredData = React.useMemo(() => {
    return data
      .filter(
        (c) =>
          c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.case_topic.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((c) =>
        outcomeFilter === 'all'
          ? true
          : c.outcome_for_subject === outcomeFilter
      );
  }, [data, searchTerm, outcomeFilter]);

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <Card>
       <CardHeader>
        <CardTitle>Case History</CardTitle>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Filter by case number or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:max-w-sm"
          />
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="winning">Winning</SelectItem>
              <SelectItem value="losing">Losing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile View */}
        <div className="space-y-2 md:hidden">
          {sortedData.map((c) => (
            <div
              key={c.case_number+c.case_topic}
              onClick={() => setSelectedCase(c)}
              className="cursor-pointer border-b p-4 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                 <div className="flex flex-1 items-center gap-4">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{c.case_number}</p>
                    <p className="text-sm text-muted-foreground">{c.case_topic}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-2 flex items-center justify-between pl-9 text-sm">
                <p className="text-muted-foreground">
                  {new Date(c.decision_date).toLocaleDateString()}
                </p>
                <Badge
                  variant={
                    c.outcome_for_subject === 'winning' ? 'success' : 'destructive'
                  }
                  className='capitalize'
                >
                  {c.outcome_for_subject}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Case Number</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('case_topic')}>
                    Topic
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('decision_date')}
                  >
                    Decision Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Risk Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((c) => (
                <TableRow
                  key={c.case_number+c.case_topic}
                  onClick={() => setSelectedCase(c)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{c.case_number}</TableCell>
                  <TableCell>{c.case_topic}</TableCell>
                  <TableCell>
                    {new Date(c.decision_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.outcome_for_subject === 'winning' ? 'success' : 'destructive'
                      }
                      className="capitalize"
                    >
                      {c.outcome_for_subject}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.aml_esg_dd_flags_in_case.length > 0 ? (
                      <Badge
                        variant="outline"
                        className="flex w-fit items-center gap-1 border-accent text-accent-foreground"
                      >
                        <span>{c.aml_esg_dd_flags_in_case.length}</span>
                        <Flag className="h-3 w-3" />
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <TransactionDetailSheet
        selectedCase={selectedCase}
        setSelectedCase={setSelectedCase}
        report={report}
      />
    </Card>
  );
}
