"use server";

import type { Case, AmlReportOutput, PostBody } from "@/lib/types";

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
