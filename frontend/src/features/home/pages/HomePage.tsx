import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { HomeGuestPage } from "./HomeGuestPage";
import { HomeUserPage } from "./HomeUserPage";

export function HomePage() {
  const { isAuthenticated } = useAuthSession();

  if (!isAuthenticated) {
    return <HomeGuestPage />;
  }

  return <HomeUserPage />;
}