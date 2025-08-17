"use client";

import Image from "next/image";
import profile from "@/public/profile.jpeg";

export default function ProfileBadge({
  name,
  email,
  photoSrc, // e.g. "/profile.jpg"
  size = 40,
}: {
  name: string;
  email?: string;
  photoSrc?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-3">
      {photoSrc ? (
        <div
          className="relative overflow-hidden rounded-full ring-2 ring-white"
          style={{ width: size, height: size }}
        >
          <Image
            src={profile}
            alt={`${name} profile photo`}
            fill
            sizes={`${size}px`}
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div
          className="grid place-items-center rounded-full bg-violet-600 text-white ring-2 ring-white"
          style={{ width: size, height: size }}
        >
          <span className="text-sm font-medium">{initials || "?"}</span>
        </div>
      )}

      <div className="leading-tight">
        <p className="text-sm font-medium">{name}</p>
        {email && <p className="text-xs text-neutral-500">&lt;{email}&gt;</p>}
      </div>
    </div>
  );
}