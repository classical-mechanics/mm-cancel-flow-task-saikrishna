// app/api/cancel/visa/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // avoid caching

// ---------- Types & constants ----------
type Source = "withMM" | "noMM";

type CountBin = "0" | "1-5" | "6-20" | "20+";
type InterviewBin = "0" | "1-2" | "3-5" | "5+";

type OfferUsage = Partial<{
  appliedViaMM: CountBin;
  emailedCompanies: CountBin;
  interviewedCompanies: InterviewBin;
}>;

type CongratsSurvey = Partial<{
  withMM: "yes" | "no";
  jobTitle: string;
  company: string;
  city: string;
  country: string;
}>;

const COUNT_BINS: readonly CountBin[] = ["0", "1-5", "6-20", "20+"];
const INT_BINS: readonly InterviewBin[] = ["0", "1-2", "3-5", "5+"];

// ---------- Small helpers ----------
const cleanText = (v: unknown, max = 120) =>
  String(v ?? "")
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const isCount = (x: any): x is CountBin => COUNT_BINS.includes(x);
const isInt = (x: any): x is InterviewBin => INT_BINS.includes(x);

function sanitizeOfferUsage(u: any): OfferUsage {
  const out: OfferUsage = {};
  if (u && typeof u === "object") {
    if (isCount(u.appliedViaMM)) out.appliedViaMM = u.appliedViaMM;
    if (isCount(u.emailedCompanies)) out.emailedCompanies = u.emailedCompanies;
    if (isInt(u.interviewedCompanies)) out.interviewedCompanies = u.interviewedCompanies;
  }
  return out;
}

function sanitizeCongratsSurvey(s: any): CongratsSurvey {
  if (!s || typeof s !== "object") return {};
  const withMM = s.withMM === "yes" || s.withMM === "no" ? s.withMM : undefined;
  return {
    withMM,
    jobTitle: cleanText(s.jobTitle, 120) || undefined,
    company: cleanText(s.company, 120) || undefined,
    city: cleanText(s.city, 120) || undefined,
    country: cleanText(s.country, 120) || undefined,
  };
}

// Optional CSRF check (expects a cookie named "csrfToken" and header "X-CSRF-Token")
function validateCsrf(req: NextRequest): boolean {
  const cookieToken = req.cookies.get("csrfToken")?.value;
  const headerToken = req.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken) {
    // If you don’t issue a CSRF cookie yet, return true to avoid blocking.
    return true;
  }
  return cookieToken === headerToken;
}

// ---------- Handler ----------
export async function POST(req: NextRequest) {
  try {
    // CSRF (soft) check
    if (!validateCsrf(req)) {
      return NextResponse.json({ ok: false, error: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({} as any));

    // source
    const sourceRaw = body?.source;
    const source: Source = sourceRaw === "withMM" || sourceRaw === "noMM" ? sourceRaw : "noMM";

    // yes / no
    const hasCompanyLawyer = Boolean(body?.hasCompanyLawyer);

    // visa type (allow short codes like H-1B, O-1, etc.)
    const visaType = cleanText(body?.visaType, 40);
    if (visaType.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Invalid visaType (too short)" },
        { status: 400 }
      );
    }

    // congrats survey (optional)
    const congratsSurvey: CongratsSurvey = sanitizeCongratsSurvey(body?.congratsSurvey);

    // the three “how were you using” answers (optional)
    const offerUsage: OfferUsage = sanitizeOfferUsage(body?.offerUsage);

    // ---------- Persist (stub) ----------
    // TODO: Replace this with your DB call. Avoid logging `body` directly.
    // Example (Supabase Admin client):
    // const { data, error } = await supabase
    //   .from("visa_cancellations")
    //   .insert({
    //     source,
    //     has_company_lawyer: hasCompanyLawyer,
    //     visa_type: visaType,
    //     offer_usage: offerUsage,
    //     congrats_survey: congratsSurvey,
    //     // user_id: <from auth>,
    //   })
    //   .select()
    //   .single();
    // if (error) throw error;

    // Return sanitized echo for debugging in dev
    return NextResponse.json({
      ok: true,
      data: {
        source,
        hasCompanyLawyer,
        visaType,
        offerUsage,
        congratsSurvey,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Unexpected error",
      },
      { status: 500 }
    );
  }
}

// Allow OPTIONS for CORS preflight if you’re calling from other origins
export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}