import { useState } from "react";
import apiClient from "../api/client";

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const res = await api.get("/org/users");
    setUsers(res.data);
  };

  return { users, fetchUsers };
}
