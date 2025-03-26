import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Check if the user has a profile
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // If profile doesn't exist, create one
      if (profileError && profileError.code === "PGRST116") {
        await supabase.from("profiles").insert([
          {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata.full_name || "",
          },
        ]);

        // Redirect to address creation page for new users
        return NextResponse.redirect(
          new URL("/account/addresses/new?first=true", request.url)
        );
      }

      // Check if user has any addresses
      const { data: addresses } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      // If no addresses, redirect to address creation page
      if (!addresses || addresses.length === 0) {
        return NextResponse.redirect(
          new URL("/account/addresses/new?first=true", request.url)
        );
      }
    }
  }

  // Redirect to the home page
  return NextResponse.redirect(new URL("/", request.url));
}
