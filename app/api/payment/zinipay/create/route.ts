import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createZiniPayment } from "@/lib/zinipay";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // 3. Security Check: Fetch the booking and verify ownership
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id, 
        status, 
        total_amount, 
        total_price, 
        user_id,
        listings (
          title
        )
      `)
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 });
    }

    if (booking.status !== "pending") {
      return NextResponse.json({ error: "Booking is not in pending state" }, { status: 400 });
    }

    // 4. Calculate total amount
    // Use total_amount if available, otherwise total_price
    const baseAmount = booking.total_amount || booking.total_price;
    
    // In Restiqa, there's a deterministic unique offset (1-9 BDT) used for manual verification.
    // We should include this to match the UI's expected amount.
    const uniqueOffset = (parseInt(bookingId.slice(-1), 16) % 9) + 1;
    const finalAmount = Number(baseAmount) + uniqueOffset;

    // 5. Build URLs for ZiniPay redirection
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    
    const redirectUrl = `${siteUrl}/payment/success?bookingId=${bookingId}`;
    const cancelUrl = `${siteUrl}/payment/${bookingId}`;
    const webhookUrl = `${siteUrl}/api/payment/zinipay/webhook`;

    // 6. Call ZiniPay API
    const ziniResponse = await createZiniPayment({
      amount: finalAmount,
      bookingId: bookingId,
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      webhook_url: webhookUrl,
      customer_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
      customer_email: user?.email,
    });

    if (ziniResponse.status && ziniResponse.payment_url) {
      return NextResponse.json({ 
        success: true, 
        payment_url: ziniResponse.payment_url 
      });
    } else {
      console.error("ZiniPay Payment Creation Failed:", ziniResponse);
      return NextResponse.json({ 
        error: ziniResponse.message || "Failed to generate payment URL" 
      }, { status: 400 }); // Changed to 400 as it's likely a request issue (e.g. domain mismatch)
    }

  } catch (error: any) {
    console.error("ZiniPay Create API Route Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}
