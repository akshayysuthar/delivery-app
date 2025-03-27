import dynamic from "next/dynamic";

const ClerkProviderWithNoSSR = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.ClerkProvider),
  { ssr: false }
);

export default function NotFound() {
  return (
    <ClerkProviderWithNoSSR
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <div>Page not found</div>
    </ClerkProviderWithNoSSR>
  );
}
