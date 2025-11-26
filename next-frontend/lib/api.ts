const API_BASE_URL = "http://localhost:3001";

export interface User {
  id: string;
  username: string;
  role: string;
  trainerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: "individual" | "group";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: string;
  durationMinutes: number;
  trainer: User;
  participants: Array<{
    id: string;
    user: User;
    status: string;
  }>;
  roomId?: string;
}

export interface Student {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized access
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }
        throw new Error("Unauthorized");
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Auth endpoints
  async getProfile(): Promise<User> {
    return this.request<User>("/auth/profile");
  }

  // Lesson endpoints
  async getLessons(): Promise<Lesson[]> {
    return this.request<Lesson[]>("/lessons");
  }

  async getTrainerActiveLessons(trainerId: string): Promise<Lesson[]> {
    return this.request<Lesson[]>(`/lessons/trainer/${trainerId}/active`);
  }

  async joinLesson(lessonId: string): Promise<void> {
    return this.request<void>(`/lessons/${lessonId}/join`, {
      method: "POST",
    });
  }

  async startLesson(lessonId: string): Promise<void> {
    return this.request<void>(`/lessons/${lessonId}/start`, {
      method: "POST",
    });
  }

  // User endpoints
  async getMyStudents(): Promise<Student[]> {
    return this.request<Student[]>("/users/my-students");
  }
}

export const api = new ApiClient();
