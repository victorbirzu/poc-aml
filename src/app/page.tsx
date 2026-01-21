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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Building, Loader2, X, CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  processEntity,
  processEntityForDashboard1,
  processEntityForDashboard2,
  processEntityForDashboard4,
} from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    entityType: z.enum(["individual", "company"]),
    // Individual fields
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    gender: z.enum(["Male", "Female"]).optional(),
    dateOfBirth: z.date().optional().nullable(),
    placeOfBirth: z.string().optional(),
    // Company fields
    companyNames: z.array(z.string()).optional(),
    identifier: z.string().optional().refine(
      (val) => !val || val.length >= 5,
      {
        message: "Identifier must be at least 5 characters.",
      }
    ),
  })
  .superRefine((data, ctx) => {
    if (data.entityType === "individual") {
      if (!data.firstName || data.firstName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "First name must be at least 2 characters.",
          path: ["firstName"],
        });
      }
      if (!data.lastName || data.lastName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last name must be at least 2 characters.",
          path: ["lastName"],
        });
      }
    } else {
      if (!data.companyNames || data.companyNames.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one company name is required.",
          path: ["companyNames"],
        });
      } else {
        data.companyNames.forEach((name, index) => {
          if (!name || name.length < 2) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Company name must be at least 2 characters.",
              path: ["companyNames", index],
            });
          }
        });
      }
    }
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
  const [node4Response, setNode4Response] = React.useState(null);
  const [isNode4Processing, setIsNode4Processing] = React.useState(false);
  const [isNode4Completed, setIsNode4Completed] = React.useState(false);
  const [isNode4Error, setIsNode4Error] = React.useState(false);
  const [isRestored, setIsRestored] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityType: "individual",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: undefined,
      placeOfBirth: "",
      companyNames: [""],
      identifier: "",
    },
  });

  // Restore state from sessionStorage on mount
  React.useEffect(() => {
    const storedFormData = sessionStorage.getItem("lastFormData");
    const storedNode1Response = sessionStorage.getItem("dashboard1Response");
    const storedNode2Response = sessionStorage.getItem("dashboard2Response");
    const storedApiResponse = sessionStorage.getItem("apiResponse");
    const storedNode4Response = sessionStorage.getItem("dashboard4Response");
    const storedNode1Completed = sessionStorage.getItem("node1Completed");
    const storedNode1Error = sessionStorage.getItem("node1Error");
    const storedNode2Completed = sessionStorage.getItem("node2Completed");
    const storedNode2Error = sessionStorage.getItem("node2Error");
    const storedApiCompleted = sessionStorage.getItem("apiCompleted");
    const storedNode3Error = sessionStorage.getItem("node3Error");
    const storedNode4Completed = sessionStorage.getItem("node4Completed");
    const storedNode4Error = sessionStorage.getItem("node4Error");

    if (storedFormData) {
      try {
        const parsedFormData = JSON.parse(storedFormData);
        // Convert dateOfBirth string back to Date if it exists
        if (
          parsedFormData.dateOfBirth &&
          typeof parsedFormData.dateOfBirth === "string"
        ) {
          parsedFormData.dateOfBirth = new Date(parsedFormData.dateOfBirth);
        }
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

    if (storedNode4Response) {
      try {
        const parsed = JSON.parse(storedNode4Response);
        setNode4Response(parsed);
        setIsNode4Completed(storedNode4Completed === "true");
        setIsNode4Error(storedNode4Error === "true");
      } catch (e) {
        console.error("Failed to parse stored node4 response", e);
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
      sessionStorage.removeItem("dashboard4Response");
      sessionStorage.removeItem("node1Completed");
      sessionStorage.removeItem("node1Error");
      sessionStorage.removeItem("node2Completed");
      sessionStorage.removeItem("node2Error");
      sessionStorage.removeItem("apiCompleted");
      sessionStorage.removeItem("node3Error");
      sessionStorage.removeItem("node4Completed");
      sessionStorage.removeItem("node4Error");

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
      setNode4Response(null);
      setIsNode4Processing(false);
      setIsNode4Completed(false);
      setIsNode4Error(false);
      setSubmitted(false);
      setIsSubmitting(false);
      setEntityType("individual");
      setIsClearing(false);

      // Reset form
      form.reset({
        entityType: "individual",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: undefined,
        dateOfBirth: undefined,
        placeOfBirth: "",
        companyNames: [""],
        identifier: "",
      });

      // Small delay to ensure state is reset before restoring
      setTimeout(() => {
        setIsRestored(true);
      }, 100);
    }, ANIMATION_DURATION.slow * 1000 + 600); // Wait for reverse animation + buffer
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
    } else if (id === "4" && node4Response) {
      sessionStorage.setItem(
        "dashboard4Response",
        JSON.stringify(node4Response)
      );
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

    // Construct name for API calls
    // For requests 1, 2, 3: use first company name or individual name
    // For request 4: use full companyNames array
    const firstCompanyName =
      values.entityType === "company" &&
      values.companyNames &&
      values.companyNames.length > 0
        ? values.companyNames[0]
        : "";

    const apiFormData = {
      ...values,
      name:
        values.entityType === "individual"
          ? [
              values.firstName || "",
              values.middleName || "",
              values.lastName || "",
            ]
              .filter(Boolean)
              .join(" ")
          : firstCompanyName,
    } as FormData & { name: string };

    setFormData(apiFormData);
    setSubmitted(true);

    // Save form data to sessionStorage
    sessionStorage.setItem("lastFormData", JSON.stringify(apiFormData));

    // Start all API calls in parallel
    const node1Promise = (async () => {
      setIsNode1Processing(true);
      try {
        const response = await processEntityForDashboard1(apiFormData);
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
        const response = await processEntityForDashboard2(apiFormData);
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
        const response = await processEntity(apiFormData);
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

    const node4Promise = (async () => {
      setIsNode4Processing(true);
      try {
        // For request 4, send the full form data with companyNames array
        const response = await processEntityForDashboard4(values);
        setNode4Response(response);
        setIsNode4Completed(true);
        setIsNode4Error(false);
        // Save to sessionStorage
        sessionStorage.setItem("dashboard4Response", JSON.stringify(response));
        sessionStorage.setItem("node4Completed", "true");
        sessionStorage.removeItem("node4Error");
      } catch (error) {
        console.error("API call for node 4 failed:", error);
        setIsNode4Completed(false);
        setIsNode4Error(true);
        sessionStorage.setItem("node4Completed", "false");
        sessionStorage.setItem("node4Error", "true");
        toast({
          variant: "destructive",
          title: "An error occurred",
          description:
            "Failed to fetch data for Lexis Nexis. Please try again.",
        });
      } finally {
        setIsNode4Processing(false);
      }
    })();

    try {
      await Promise.all([
        node1Promise,
        node2Promise,
        node3Promise,
        node4Promise,
      ]);
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
          "flex h-full w-full flex-col  gap-8",
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
          className={cn(
            "flex w-full gap-8 transition-all duration-300",
            submitted && !isClearing ? "px-4 lg:px-8" : "px-0"
          )}
          animate={{
            flexDirection: submitted && !isClearing ? "row" : "row",
            alignItems: submitted && !isClearing ? "flex-start" : "center",
            justifyContent: submitted && !isClearing ? "center" : "center",
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

                {entityType === "individual" ? (
                  <>
                    {/* First Name */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter first name..."
                              {...field}
                              disabled={isSubmitting || submitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Middle Name */}
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter middle name (optional)..."
                              {...field}
                              disabled={isSubmitting || submitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Last Name */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter last name..."
                              {...field}
                              disabled={isSubmitting || submitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* IDNP */}
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IDNP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter IDNP (optional)..."
                              {...field}
                              disabled={isSubmitting || submitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender, Date of Birth, and Place of Birth in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Gender */}
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              disabled={isSubmitting || submitted}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date of Birth */}
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "h-10 w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting || submitted}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  captionLayout="dropdown"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  fromDate={new Date("1900-01-01")}
                                  toDate={new Date()}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Place of Birth */}
                      <FormField
                        control={form.control}
                        name="placeOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Place of Birth</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              disabled={isSubmitting || submitted}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Place" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MD">MD - Moldova</SelectItem>
                                <SelectItem value="RO">RO - Romania</SelectItem>
                                <SelectItem value="RU">RU - Russia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Company Names */}
                    <FormField
                      control={form.control}
                      name="companyNames"
                      render={({ field }) => {
                        // Ensure field.value is always an array
                        const companyNames = Array.isArray(field.value)
                          ? field.value
                          : [""];

                        return (
                          <FormItem>
                            <FormLabel>Company Names *</FormLabel>
                            <div className="space-y-2">
                              {companyNames.map((name, index) => (
                                <div key={index} className="flex gap-2">
                                  <FormControl>
                                    <Input
                                      placeholder="Enter company name..."
                                      value={name}
                                      onChange={(e) => {
                                        const newNames = [...companyNames];
                                        newNames[index] = e.target.value;
                                        field.onChange(newNames);
                                      }}
                                      disabled={isSubmitting || submitted}
                                    />
                                  </FormControl>
                                  {index > 0 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        const newNames = companyNames.filter(
                                          (_, i) => i !== index
                                        );
                                        field.onChange(
                                          newNames.length > 0 ? newNames : [""]
                                        );
                                      }}
                                      disabled={isSubmitting || submitted}
                                      className="shrink-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  field.onChange([...companyNames, ""]);
                                }}
                                disabled={isSubmitting || submitted}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Company Name
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* IDNO */}
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IDNO</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter IDNO (optional)..."
                              {...field}
                              disabled={isSubmitting || submitted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

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
            {submitted && isRestored && (
              <motion.div
                key="circles-container"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{
                  opacity: isClearing ? 0 : 1,
                  x: isClearing ? 50 : 0,
                  scale: isClearing ? 0.95 : 1,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: isClearing
                    ? ANIMATION_DURATION.slow
                    : ANIMATION_DURATION.normal,
                  ease: isClearing ? "easeIn" : "easeOut",
                  delay: isClearing ? 0.6 : 0.2,
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
                      {formData.entityType === "individual"
                        ? `${formData.firstName || ""} ${
                            formData.lastName || ""
                          }`.trim() || "Individual"
                        : formData.companyNames?.filter(Boolean).join(", ") ||
                          "Company"}
                    </h2>
                  </motion.div>
                )}
                <AnimatedNodes
                  onAnimationComplete={handleAnimationComplete}
                  onNodeClick={handleNodeClick}
                  mainNodeLabel={
                    formData?.entityType === "individual"
                      ? `${formData.firstName || ""} ${
                          formData.lastName || ""
                        }`.trim() || "Individual"
                      : formData?.companyNames?.filter(Boolean).join(", ") ||
                        "Company"
                  }
                  isApiProcessing={isNode3Processing}
                  isApiCompleted={apiNodeCompleted}
                  isApiError={isNode3Error}
                  isNode1Processing={isNode1Processing}
                  isNode1Completed={isNode1Completed}
                  isNode1Error={isNode1Error}
                  isNode2Processing={isNode2Processing}
                  isNode2Completed={isNode2Completed}
                  isNode2Error={isNode2Error}
                  isNode4Processing={isNode4Processing}
                  isNode4Completed={isNode4Completed}
                  isNode4Error={isNode4Error}
                  isClearing={isClearing}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
