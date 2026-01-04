import { API_URL } from "@/lib/api";
import type { WorkoutReaction } from "@/types/workout";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Kein Token gefunden.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const parseResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || "Unbekannter Fehler.";
    throw new Error(message);
  }
  return data;
};

export const createReaction = async (
  workoutId: string,
  emoji: string
): Promise<WorkoutReaction[]> => {
  const response = await fetch(`${API_URL}/reactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ workoutId, emoji }),
  });

  const data = await parseResponse(response);
  return Array.isArray(data.reactions) ? data.reactions : [];
};

export const removeReaction = async (
  workoutId: string
): Promise<WorkoutReaction[]> => {
  const response = await fetch(`${API_URL}/reactions/${workoutId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseResponse(response);
  return Array.isArray(data.reactions) ? data.reactions : [];
};

export const getWorkoutReactions = async (
  workoutId: string
): Promise<WorkoutReaction[]> => {
  const response = await fetch(`${API_URL}/reactions/workout/${workoutId}`, {
    headers: getAuthHeaders(),
  });

  const data = await parseResponse(response);
  return Array.isArray(data.reactions) ? data.reactions : [];
};
