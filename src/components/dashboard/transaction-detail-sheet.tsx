'use client';

import type { Case, AmlReportOutput } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface TransactionDetailSheetProps {
  selectedCase: Case | null;
  setSelectedCase: (c: Case | null) => void;
  report: AmlReportOutput;
}

export function TransactionDetailSheet({
  selectedCase,
  setSelectedCase,
  report,
}: TransactionDetailSheetProps) {
  if (!selectedCase) return null;

  return (
    <Sheet
      open={!!selectedCase}
      onOpenChange={(isOpen) => !isOpen && setSelectedCase(null)}
    >
      <SheetContent className="w-full sm:max-w-2xl p-0">
        <ScrollArea className="h-full">
          <div className="flex h-full flex-col">
            <SheetHeader className="p-4 sm:p-6">
              <SheetTitle className="text-xl sm:text-2xl">
                {selectedCase.case_number}
              </SheetTitle>
              <SheetDescription>{selectedCase.case_topic}</SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="flex-1 space-y-6 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Court:{' '}
                  </span>{' '}
                  {selectedCase.court}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Decision Date:{' '}
                  </span>
                  {new Date(selectedCase.decision_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Status:{' '}
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {selectedCase.procedural_status}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Subject Role:{' '}
                  </span>
                   <Badge variant="outline" className="capitalize">
                    {selectedCase.subject_role}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Outcome:{' '}
                  </span>
                  <Badge
                    variant={
                      selectedCase.outcome_for_subject === 'winning'
                        ? 'success'
                        : 'destructive'
                    }
                    className="ml-2 capitalize"
                  >
                    {selectedCase.outcome_for_subject}
                  </Badge>
                </div>
              </div>

              <Separator />
              <div>
                <h4 className="mb-2 font-semibold">Financial Impact</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Disputed: </span>
                    {selectedCase.financial_impact.disputed_amount}{' '}
                    {selectedCase.financial_impact.currency}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Admitted: </span>
                    {selectedCase.financial_impact.admitted_amount}{' '}
                    {selectedCase.financial_impact.currency}
                  </p>
                  {selectedCase.financial_impact.penalties && (
                    <p>
                      <span className="text-muted-foreground">Penalties: </span>
                      {selectedCase.financial_impact.penalties}{' '}
                      {selectedCase.financial_impact.currency}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-semibold">AML/ESG/DD Flags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.aml_esg_dd_flags_in_case.length > 0 ? (
                    selectedCase.aml_esg_dd_flags_in_case.map((flag) => (
                      <Badge
                        key={flag}
                        variant="outline"
                        className="border-accent text-accent-foreground capitalize"
                      >
                        {flag.replace(/_/g, ' ')}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No flags in this case.
                    </p>
                  )}
                </div>
              </div>
              
              <Separator />

              <div>
                <h4 className="mb-2 font-semibold">Documents</h4>
                <div className="space-y-2">
                  {selectedCase.documents.map((doc) => (
                    <div
                      key={doc.document_id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.source}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {doc.document_id}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          View
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-semibold">Procedural History</h4>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {selectedCase.procedural_history.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
