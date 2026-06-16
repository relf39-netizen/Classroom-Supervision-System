/**
 * Client-side API utility for MySQL (via Express backend)
 * Use this to interact with the MySQL database on Windows Server
 */

export const api_ops = {
  list: async <T>(table: string, filters?: { [key: string]: any }): Promise<T[]> => {
    try {
      const response = await fetch(`/api/db/${table}/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ where: filters })
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      console.error(`MySQL API Error (list ${table}):`, error);
      return [];
    }
  },

  create: async <T>(table: string, data: any): Promise<string> => {
    try {
      const response = await fetch(`/api/db/${table}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      return result.id || "";
    } catch (error) {
      console.error(`MySQL API Error (create ${table}):`, error);
      return "";
    }
  },

  login: async (username: string, password: string): Promise<any> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login fail");
      }
      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }
};
