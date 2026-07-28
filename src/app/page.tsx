import { headers } from "next/headers";
import { userAgent } from "next/server";
import { DesktopLanding } from "@/components/landing/DesktopLanding";
import { MobileLanding } from "@/components/landing/MobileLanding";

export const dynamic = "force-dynamic";

export default async function Home() {
  const headersList = await headers();
  const { device } = userAgent({ headers: headersList });
  const isMobile = device.type === "mobile" || device.type === "tablet";

  if (isMobile) {
    return <MobileLanding />;
  }

  return <DesktopLanding />;
}
