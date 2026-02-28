/**
 * Person service - wraps person database operations with error handling
 */
import * as queries from "../db/queries.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type {
  Person,
  CreatePersonInput,
  UpdatePersonInput,
} from "../db/types.js";

export async function createPerson(
  input: CreatePersonInput,
): Promise<ServiceResult<Person>> {
  console.log("[personService:createPerson] Creating person:", input.name);
  try {
    const person = queries.createPerson(input);
    console.log("[personService:createPerson] Created person:", person.id);
    return { success: true, data: person };
  } catch (error) {
    console.error("[personService:createPerson] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to create person",
        details: error,
      },
    };
  }
}

export async function getPerson(
  id: string,
): Promise<ServiceResult<Person | null>> {
  console.log("[personService:getPerson] Fetching person:", id);
  try {
    const person = queries.getPerson(id);
    console.log("[personService:getPerson] Result:", person ? person.name : "not found");
    return { success: true, data: person };
  } catch (error) {
    console.error("[personService:getPerson] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get person",
        details: error,
      },
    };
  }
}

export async function getAllPeople(): Promise<ServiceResult<Person[]>> {
  console.log("[personService:getAllPeople] Fetching all people");
  try {
    const people = queries.getAllPeople();
    console.log("[personService:getAllPeople] Found", people.length, "people");
    return { success: true, data: people };
  } catch (error) {
    console.error("[personService:getAllPeople] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get all people",
        details: error,
      },
    };
  }
}

export async function updatePerson(
  id: string,
  input: UpdatePersonInput,
): Promise<ServiceResult<Person | null>> {
  console.log("[personService:updatePerson] Updating person:", id, "with:", JSON.stringify(input));
  try {
    const person = queries.updatePerson(id, input);
    console.log("[personService:updatePerson] Updated:", person ? person.name : "not found");
    return { success: true, data: person };
  } catch (error) {
    console.error("[personService:updatePerson] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to update person",
        details: error,
      },
    };
  }
}

export async function deletePerson(
  id: string,
): Promise<ServiceResult<boolean>> {
  console.log("[personService:deletePerson] Deleting person:", id);
  try {
    const result = queries.deletePerson(id);
    console.log("[personService:deletePerson] Deleted:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("[personService:deletePerson] Failed:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to delete person",
        details: error,
      },
    };
  }
}