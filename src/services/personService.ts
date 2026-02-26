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
  try {
    const person = queries.createPerson(input);
    return { success: true, data: person };
  } catch (error) {
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
  try {
    const person = queries.getPerson(id);
    return { success: true, data: person };
  } catch (error) {
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
  try {
    const people = queries.getAllPeople();
    return { success: true, data: people };
  } catch (error) {
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
  try {
    const person = queries.updatePerson(id, input);
    return { success: true, data: person };
  } catch (error) {
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
  try {
    const result = queries.deletePerson(id);
    return { success: true, data: result };
  } catch (error) {
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