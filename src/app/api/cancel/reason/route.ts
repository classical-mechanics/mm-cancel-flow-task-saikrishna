// app/api/cancel/reason/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE, stripTags } from "@/src/lib/security";

const COUNT_BINS = new Set(["0","1-5","6-20","20+"]);
const IV_BINS = new Set(["0","1-2","3-5","5+"]);

type OfferSurvey = {
  appliedViaMM?: "0"|"1-5"|"6-20"|"20+";
  emailedCompanies?: "0"|"1-5"|"6-20"|"20+";
  interviewedCompanies?: "0"|"1-2"|"3-5"|"5+";
};

export async function POST(req: NextRequest) {
  const header = req.headers.get("x-csrf-token");
  const cookie = req.cookies.get(CSRF_COOKIE)?.value;
  if (!header || !cookie || header !== cookie) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const reason = String(body.reason || "");
  const offerSurvey: OfferSurvey = body.offerSurvey ?? {};

  // Validate reason-specific fields (examples)
  if (reason === "too_expensive") {
    const cents = Number(body.maxPriceCents);
    if (!Number.isFinite(cents) || cents <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
  } else {
    const details = stripTags(String(body.details ?? ""));
    if (!details || details.length < 25) {
      return NextResponse.json({ error: "Details too short" }, { status: 400 });
    }
  }

  // Validate survey bins (optional: all optional fields)
  const surveySafe: OfferSurvey = {};
  if (offerSurvey.appliedViaMM && COUNT_BINS.has(offerSurvey.appliedViaMM))
    surveySafe.appliedViaMM = offerSurvey.appliedViaMM;
  if (offerSurvey.emailedCompanies && COUNT_BINS.has(offerSurvey.emailedCompanies))
    surveySafe.emailedCompanies = offerSurvey.emailedCompanies;
  if (offerSurvey.interviewedCompanies && IV_BINS.has(offerSurvey.interviewedCompanies))
    surveySafe.interviewedCompanies = offerSurvey.interviewedCompanies;

  // TODO: persist cancellation + survey in one transaction
  // await db.cancellations.insert({ user_id, reason, details/maxPriceCents, survey: surveySafe })

  return NextResponse.json({ ok: true });
}