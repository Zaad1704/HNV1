import React, { useEffect } from "react";
import { useUsers } from "../hooks/useUsers";

const UsersPage: React.FC = () => {
  const { users, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">Organization Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="mb-2">
            {user.name} — {user.email} — <span className="italic">{user.role}</span>
          </li>
        ))}
      </ul>
      {/* Add invite/remove logic here */}
    </div>
  );
};

export default UsersPage;