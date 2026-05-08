import { useEffect, useMemo, useState } from "react";
import { NotificationContext } from "./NotificationContextObject";
import { getSocket } from "../services/socket";

export function NotificationProvider({ children }) {
  const [supportUnread, setSupportUnread] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("support:new-message", (data) => {
      const currentRole = localStorage.getItem("adminUser")
        ? "admin"
        : localStorage.getItem("customerUser")
        ? "customer"
        : "guest";

      if (data.sender !== currentRole) {
        setSupportUnread((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("support:new-message");
    };
  }, []);

  const value = useMemo(
    () => ({
      supportUnread,
      clearSupportUnread: () => setSupportUnread(0),
    }),
    [supportUnread]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}