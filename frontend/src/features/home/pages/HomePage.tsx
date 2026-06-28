import { useAuthUserQuery } from "@/features/auth/server";
import { HomeGuestPage } from "./HomeGuestPage";
import { HomeUserPage } from "./HomeUserPage";

export function HomePage() {
  const userQuery = useAuthUserQuery();
  const isAuthenticated = userQuery.data !== null && userQuery.data !== undefined;

  if (!isAuthenticated) {
    return <HomeGuestPage />;
  }

  return <HomeUserPage />;
}
