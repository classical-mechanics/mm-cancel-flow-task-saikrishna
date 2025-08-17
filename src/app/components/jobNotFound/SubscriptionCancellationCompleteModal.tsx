// components/SubscriptionCancellationCompleteModal.tsx
"use client";

import Image, {StaticImageData} from "next/image";

type Props = {
  cityImg: Img;
  open: boolean;
  onClose: () => void;
  /** Optional: called when "Back to Jobs" is pressed. If not provided, falls back to `onClose`. */
  onBackToJobs?: () => void;
  /** Optional: if provided, the "Back to Jobs" button becomes an <a> link to this href. */
  backToJobsHref?: string;
  /** Optional display date, e.g. "Sep 28". */
  endDate?: string;
  /** Optional hero image. */
  imageSrc?: string;
};

type Img = StaticImageData | string;

export default function SubscriptionCancellationCompleteModal({
  cityImg,
  open,
  onClose,
  onBackToJobs,
  backToJobsHref,
  endDate = "XX date",
}: Props) {
  if (!open) return null;

  const BackToJobsButton = () => {
    if (backToJobsHref) {
      return (
        <a
          href={backToJobsHref}
          className="block w-full rounded-md bg-violet-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          Back to Jobs
        </a>
      );
    }
    return (
      <button
        type="button"
        onClick={onBackToJobs ?? onClose}
        className="w-full rounded-md bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-300"
      >
        Back to Jobs
      </button>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-complete-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <section className="relative z-10 h-dvh w-full overflow-y-auto rounded-none bg-white md:h-auto md:w-[min(980px,92vw)] md:rounded-2xl md:border md:border-black/10">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              ← Back
            </button>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm font-medium text-neutral-700 sm:block">
              Subscription Cancelled
            </p>
            {/* Progress pills (green + Completed) */}
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="h-2 w-6 rounded-full bg-emerald-500" />
              <span className="h-2 w-6 rounded-full bg-emerald-500" />
              <span className="h-2 w-6 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-medium text-emerald-600">Completed</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        {/* Mobile hero */}
        <div className="md:hidden">
          <div className="relative mx-4 mt-4 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200">
            <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-6 px-4 pb-6 pt-4 md:grid-cols-2 md:gap-10 md:px-6 md:py-6">
          {/* Left copy */}
          <div>
            <h1
              id="cancel-complete-title"
              className="text-[26px] font-semibold leading-tight tracking-tight"
            >
              Sorry to see you go, mate.
            </h1>
            <p className="mt-2 text-[15px] font-medium text-neutral-800">
              Thanks for being with us, and you’re always welcome back.
            </p>

            <div className="mt-4 space-y-3 text-sm text-neutral-700">
              <p>
                Your subscription is set to end on <span className="font-medium">{endDate}</span>.
                <br />
                You’ll still have full access until then. No further charges after that.
              </p>
              <p className="text-neutral-600">
                Changed your mind? You can reactivate anytime before your end date.
              </p>
            </div>

            <div className="mt-6">
              <BackToJobsButton />
            </div>
          </div>

          {/* Right hero (desktop) */}
          <div className="hidden md:block">
            <div
              className="overflow-hidden rounded-xl border border-neutral-200"
              aria-hidden="true"
            >
              <div className="relative h-[320px] w-full">
                <Image
                  src={cityImg}
                  alt="City skyline"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}