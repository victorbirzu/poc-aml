"use server";

import type {
  Case,
  AmlReportOutput,
  PostBody,
  RequestBody,
  Individual,
  Business,
} from "@/lib/types";

export async function processEntity(formData: PostBody) {
  try {
    const apiUrl =
      process.env.API_WEBHOOK_URL_3 ||
      process.env.NEXT_PUBLIC_API_WEBHOOK_URL_3;
    if (!apiUrl) {
      throw new Error("API webhook URL for node 3 is not configured");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cautat: formData.name,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const amlReport = await data[0].output;
    return amlReport;
  } catch (error) {
    console.error("Failed to process entity:", error);
    throw new Error("Failed to process entity.");
  }
}

export async function processEntityForDashboard1(formData: PostBody) {
  try {
    const apiUrl =
      process.env.API_WEBHOOK_URL_1 ||
      process.env.NEXT_PUBLIC_API_WEBHOOK_URL_1;
    if (!apiUrl) {
      throw new Error("API webhook URL for node 1 is not configured");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cautat: formData.name,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data);
    const amlReport = data[0]?.output || data;
    return amlReport;
  } catch (error) {
    console.error("Failed to process entity for dashboard 1:", error);
    throw new Error("Failed to process entity for dashboard 1.");
  }
}

export async function processEntityForDashboard2(formData: PostBody) {
  try {
    const apiUrl =
      process.env.API_WEBHOOK_URL_2 ||
      process.env.NEXT_PUBLIC_API_WEBHOOK_URL_2;
    if (!apiUrl) {
      throw new Error("API webhook URL for node 2 is not configured");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cautat: formData.name,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const amlReport = data[0]?.output || data;
    return amlReport;
  } catch (error) {
    console.error("Failed to process entity for dashboard 2:", error);
    throw new Error("Failed to process entity for dashboard 2.");
  }
}

export async function processEntityForDashboard4(formData: {
  entityType: "individual" | "company";
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: "Male" | "Female";
  dateOfBirth?: Date | null;
  placeOfBirth?: string;
  companyNames?: string[];
  identifier?: string;
}) {
  try {
    const apiUrl =
      process.env.API_WEBHOOK_URL_4 ||
      process.env.NEXT_PUBLIC_API_WEBHOOK_URL_4;
    if (!apiUrl) {
      throw new Error("API webhook URL for node 4 is not configured");
    }

    // Convert form data to Individual or Business format
    let requestBody: RequestBody;

    if (formData.entityType === "individual") {
      // Format date of birth as YYYY-MM-DD if provided
      let dateOfBirthFormatted: `${string}-${string}-${string}` | undefined;
      if (formData.dateOfBirth) {
        const year = formData.dateOfBirth.getFullYear();
        const month = String(formData.dateOfBirth.getMonth() + 1).padStart(
          2,
          "0"
        );
        const day = String(formData.dateOfBirth.getDate()).padStart(2, "0");
        dateOfBirthFormatted =
          `${year}-${month}-${day}` as `${string}-${string}-${string}`;
      }

      const individual: Individual = {
        entityType: "Individual",
        firstName: formData.firstName || "",
        middleName: formData.middleName || "",
        lastName: formData.lastName || "",
        gender: formData.gender || "Male", // Default to "Male" if not provided
        ...(dateOfBirthFormatted && { dateOfBirth: dateOfBirthFormatted }),
        ...(formData.placeOfBirth && { placeOfBirth: formData.placeOfBirth }),
      };
      requestBody = individual;
    } else {
      // Business entity
      const business: Business = {
        entityType: "Business",
        companyNames: formData.companyNames?.filter(Boolean) || [],
      };
      requestBody = business;
    }
    console.log("requestBody", requestBody);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("response", response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const amlReport = data[0]?.output || data;
    return amlReport;
  } catch (error) {
    console.error("Failed to process entity for dashboard 4:", error);
    throw new Error("Failed to process entity for dashboard 4.");
  }
}
