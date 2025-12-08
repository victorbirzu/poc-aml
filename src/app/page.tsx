"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedNodes from "@/components/dashboard/animated-nodes";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Building, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  processEntity,
  processEntityForDashboard1,
  processEntityForDashboard2,
} from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  entityType: z.enum(["individual", "company"]),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  identifier: z.string().min(5, {
    message: "Identifier must be at least 5 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [entityType, setEntityType] = React.useState("individual");
  const [formData, setFormData] = React.useState<FormData | null>(null);
  const [apiResponse, setApiResponse] = React.useState(null);
  const [isNode3Processing, setIsNode3Processing] = React.useState(false);
  const [apiNodeCompleted, setApiNodeCompleted] = React.useState(false);
  const [isNode3Error, setIsNode3Error] = React.useState(false);
  const [node1Response, setNode1Response] = React.useState(null);
  const [isNode1Processing, setIsNode1Processing] = React.useState(false);
  const [isNode1Completed, setIsNode1Completed] = React.useState(false);
  const [isNode1Error, setIsNode1Error] = React.useState(false);
  const [node2Response, setNode2Response] = React.useState(null);
  const [isNode2Processing, setIsNode2Processing] = React.useState(false);
  const [isNode2Completed, setIsNode2Completed] = React.useState(false);
  const [isNode2Error, setIsNode2Error] = React.useState(false);
  const [isRestored, setIsRestored] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityType: "individual",
      name: "",
      identifier: "",
    },
  });

  // Restore state from sessionStorage on mount
  React.useEffect(() => {
    const storedFormData = sessionStorage.getItem("lastFormData");
    const storedNode1Response = sessionStorage.getItem("dashboard1Response");
    const storedNode2Response = sessionStorage.getItem("dashboard2Response");
    const storedApiResponse = sessionStorage.getItem("apiResponse");
    const storedNode1Completed = sessionStorage.getItem("node1Completed");
    const storedNode1Error = sessionStorage.getItem("node1Error");
    const storedNode2Completed = sessionStorage.getItem("node2Completed");
    const storedNode2Error = sessionStorage.getItem("node2Error");
    const storedApiCompleted = sessionStorage.getItem("apiCompleted");
    const storedNode3Error = sessionStorage.getItem("node3Error");

    if (storedFormData) {
      try {
        const parsedFormData = JSON.parse(storedFormData);
        setFormData(parsedFormData);
        setEntityType(parsedFormData.entityType || "individual");
        setSubmitted(true);
        form.reset(parsedFormData);
      } catch (e) {
        console.error("Failed to parse stored form data", e);
      }
    }

    if (storedNode1Response) {
      try {
        const parsed = JSON.parse(storedNode1Response);
        setNode1Response(parsed);
        setIsNode1Completed(storedNode1Completed === "true");
        setIsNode1Error(storedNode1Error === "true");
      } catch (e) {
        console.error("Failed to parse stored node1 response", e);
      }
    }

    if (storedNode2Response) {
      try {
        const parsed = JSON.parse(storedNode2Response);
        setNode2Response(parsed);
        setIsNode2Completed(storedNode2Completed === "true");
        setIsNode2Error(storedNode2Error === "true");
      } catch (e) {
        console.error("Failed to parse stored node2 response", e);
      }
    }

    if (storedApiResponse) {
      try {
        const parsed = JSON.parse(storedApiResponse);
        setApiResponse(parsed);
        setApiNodeCompleted(storedApiCompleted === "true");
        setIsNode3Error(storedNode3Error === "true");
      } catch (e) {
        console.error("Failed to parse stored api response", e);
      }
    }

    setIsRestored(true);
  }, [form]);

  const handleAnimationComplete = () => {
    // No automatic navigation
  };

  const handleClear = () => {
    // Start clearing animation
    setIsClearing(true);
    setIsRestored(false);

    // Wait for exit animation to complete before resetting layout
    setTimeout(() => {
      // Clear sessionStorage
      sessionStorage.removeItem("lastFormData");
      sessionStorage.removeItem("dashboard1Response");
      sessionStorage.removeItem("dashboard2Response");
      sessionStorage.removeItem("apiResponse");
      sessionStorage.removeItem("node1Completed");
      sessionStorage.removeItem("node1Error");
      sessionStorage.removeItem("node2Completed");
      sessionStorage.removeItem("node2Error");
      sessionStorage.removeItem("apiCompleted");
      sessionStorage.removeItem("node3Error");

      // Reset all state
      setFormData(null);
      setApiResponse(null);
      setIsNode3Processing(false);
      setApiNodeCompleted(false);
      setIsNode3Error(false);
      setNode1Response(null);
      setIsNode1Processing(false);
      setIsNode1Completed(false);
      setIsNode1Error(false);
      setNode2Response(null);
      setIsNode2Processing(false);
      setIsNode2Completed(false);
      setIsNode2Error(false);
      setSubmitted(false);
      setIsSubmitting(false);
      setEntityType("individual");
      setIsClearing(false);

      // Reset form
      form.reset({
        entityType: "individual",
        name: "",
        identifier: "",
      });

      // Small delay to ensure state is reset before restoring
      setTimeout(() => {
        setIsRestored(true);
      }, 100);
    }, ANIMATION_DURATION.normal * 1000 + 100); // Wait for exit animation + buffer
  };

  const handleNodeClick = (id?: number | string) => {
    // Ensure data is saved to sessionStorage before navigation
    if (id === "1" && node1Response) {
      sessionStorage.setItem(
        "dashboard1Response",
        JSON.stringify(node1Response)
      );
    } else if (id === "2" && node2Response) {
      sessionStorage.setItem(
        "dashboard2Response",
        JSON.stringify(node2Response)
      );
    } else if (id === "3" && apiResponse) {
      sessionStorage.setItem("apiResponse", JSON.stringify(apiResponse));
    }
    // Don't remove data when clicking nodes - keep it for navigation back

    if (id) {
      router.push(`/dashboard/${id}`);
    } else {
      router.push("/dashboard");
    }
  };

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setFormData(values);
    setSubmitted(true);

    // Save form data to sessionStorage
    sessionStorage.setItem("lastFormData", JSON.stringify(values));

    // Start all API calls in parallel
    const node1Promise = (async () => {
      setIsNode1Processing(true);
      try {
        const response = await processEntityForDashboard1(values);
        setNode1Response(response);
        setIsNode1Completed(true);
        setIsNode1Error(false);
        // Save to sessionStorage
        sessionStorage.setItem("dashboard1Response", JSON.stringify(response));
        sessionStorage.setItem("node1Completed", "true");
        sessionStorage.removeItem("node1Error");
      } catch (error) {
        console.error("API call for node 1 failed:", error);
        setIsNode1Completed(false);
        setIsNode1Error(true);
        sessionStorage.setItem("node1Completed", "false");
        sessionStorage.setItem("node1Error", "true");
        toast({
          variant: "destructive",
          title: "An error occurred",
          description:
            "Failed to fetch data for MD Justice systems. Please try again.",
        });
      } finally {
        setIsNode1Processing(false);
      }
    })();

    const node2Promise = (async () => {
      setIsNode2Processing(true);
      try {
        const response = await processEntityForDashboard2(values);
        setNode2Response(response);
        setIsNode2Completed(true);
        setIsNode2Error(false);
        // Save to sessionStorage
        sessionStorage.setItem("dashboard2Response", JSON.stringify(response));
        sessionStorage.setItem("node2Completed", "true");
        sessionStorage.removeItem("node2Error");
      } catch (error) {
        console.error("API call for node 2 failed:", error);
        setIsNode2Completed(false);
        setIsNode2Error(true);
        sessionStorage.setItem("node2Completed", "false");
        sessionStorage.setItem("node2Error", "true");
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Failed to fetch data for Screening. Please try again.",
        });
      } finally {
        setIsNode2Processing(false);
      }
    })();

    const node3Promise = (async () => {
      setIsNode3Processing(true);
      try {
        const response = await processEntity(values);
        setApiResponse(response);
        setApiNodeCompleted(true);
        setIsNode3Error(false);
        // Save to sessionStorage
        sessionStorage.setItem("apiResponse", JSON.stringify(response));
        sessionStorage.setItem("apiCompleted", "true");
        sessionStorage.removeItem("node3Error");
      } catch (error) {
        console.error("API call for node 3 failed:", error);
        setApiNodeCompleted(false);
        setIsNode3Error(true);
        sessionStorage.setItem("apiCompleted", "false");
        sessionStorage.setItem("node3Error", "true");
        toast({
          variant: "destructive",
          title: "An error occurred",
          description:
            "Failed to fetch data for Reputational & Adverse Media. Please try again.",
        });
      } finally {
        setIsNode3Processing(false);
      }
    })();

    try {
      await Promise.all([node1Promise, node2Promise, node3Promise]);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Animation timing constants for consistency
  const ANIMATION_DURATION = {
    fast: 0.3,
    normal: 0.6,
    slow: 0.9,
  };

  return (
    <DashboardLayout>
      <motion.div
        className={cn(
          "flex h-full w-full flex-col items-center gap-8",
          submitted ? "justify-start pt-16" : "justify-center"
        )}
        animate={{
          justifyContent: submitted ? "flex-start" : "center",
          paddingTop: submitted ? 64 : 0,
        }}
        transition={{ duration: ANIMATION_DURATION.slow, ease: "easeInOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION_DURATION.normal }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight">AML Screening</h1>
          <p className="text-muted-foreground">
            Anti-Money Laundering Compliance Check
          </p>
        </motion.div>

        <motion.div
          className="flex w-full gap-8"
          animate={{
            flexDirection: submitted && !isClearing ? "row" : "column",
            alignItems: submitted && !isClearing ? "flex-start" : "center",
            justifyContent: submitted && !isClearing ? "center" : "center",
            paddingX: submitted && !isClearing ? 16 : 0,
          }}
          transition={{ duration: ANIMATION_DURATION.slow, ease: "easeInOut" }}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              layout: {
                duration: ANIMATION_DURATION.slow,
                type: "spring",
                stiffness: 300,
              },
              opacity: { duration: ANIMATION_DURATION.normal },
              scale: { duration: ANIMATION_DURATION.normal },
            }}
            className={cn(
              "rounded-lg p-6 bg-card border border-border transition-all duration-300",
              submitted ? "w-full max-w-lg flex-shrink-0" : "w-full max-w-lg"
            )}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: ANIMATION_DURATION.normal,
                    delay: 0.1,
                  }}
                  className="space-y-2"
                >
                  <FormLabel className="text-base font-bold">
                    Entity Type
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Please choose Individual or Company
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: ANIMATION_DURATION.normal,
                    delay: 0.2,
                  }}
                >
                  <Tabs
                    value={entityType}
                    className="w-full"
                    onValueChange={(value) => {
                      setEntityType(value);
                      form.setValue(
                        "entityType",
                        value as "individual" | "company"
                      );
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="individual">
                        <User className="mr-2 h-4 w-4" />
                        Individual
                      </TabsTrigger>
                      <TabsTrigger value="company">
                        <Building className="mr-2 h-4 w-4" />
                        Company
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: ANIMATION_DURATION.normal,
                    delay: 0.3,
                  }}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter name..."
                            {...field}
                            disabled={isSubmitting || submitted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: ANIMATION_DURATION.normal,
                    delay: 0.4,
                  }}
                >
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {entityType === "individual" ? "IDNP" : "IDNO"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Enter ${
                              entityType === "individual" ? "IDNP" : "IDNO"
                            }...`}
                            {...field}
                            disabled={isSubmitting || submitted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || submitted}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process"
                    )}
                  </Button>
                  {submitted && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      disabled={isSubmitting}
                      className="flex-shrink-0"
                      title="Clear search data"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </motion.div>

          <AnimatePresence mode="wait">
            {submitted && isRestored && !isClearing && (
              <motion.div
                key="circles-container"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{
                  duration: ANIMATION_DURATION.normal,
                  ease: "easeIn",
                }}
                className="flex flex-col items-center gap-4 flex-shrink-0"
              >
                {formData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: ANIMATION_DURATION.normal,
                      delay: 0.4,
                    }}
                    className="text-center"
                  >
                    <h2 className="text-base font-normal">
                      {formData.name} / {formData.identifier}
                    </h2>
                  </motion.div>
                )}
                <AnimatedNodes
                  onAnimationComplete={handleAnimationComplete}
                  onNodeClick={handleNodeClick}
                  mainNodeLabel={formData?.name}
                  isApiProcessing={isNode3Processing}
                  isApiCompleted={apiNodeCompleted}
                  isApiError={isNode3Error}
                  isNode1Processing={isNode1Processing}
                  isNode1Completed={isNode1Completed}
                  isNode1Error={isNode1Error}
                  isNode2Processing={isNode2Processing}
                  isNode2Completed={isNode2Completed}
                  isNode2Error={isNode2Error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
