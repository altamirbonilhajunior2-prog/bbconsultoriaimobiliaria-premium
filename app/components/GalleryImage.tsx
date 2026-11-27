"use client";

import { useState } from "react";

// Explicit optimizer URLs match the portal cards and CRM thumbnails while keeping
// the global setting unchanged for signatures and other existing image consumers.
export default function GalleryImage({src,alt,sizes,className,priority=false,thumbnail=false}: {
  src:string; alt:string; sizes:string; className:string; priority?:boolean; thumbnail?:boolean;
}) {
  const [failed,setFailed]=useState(false);
  const canResize=(src.startsWith("/")&&!src.startsWith("//")&&!src.startsWith("/_next/")) ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(src);
  const optimized=canResize&&!failed;
  const widths=thumbnail?[128,256,384,640,750]:[640,750,828,1080,1200,1920,2048,3840];
  const url=(width:number)=>`/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Responsive URLs use the same Vercel optimizer as next/image.
    <img
      src={optimized?url(thumbnail?384:1200):src}
      srcSet={optimized?widths.map(width=>`${url(width)} ${width}w`).join(", "):undefined}
      sizes={optimized?sizes:undefined}
      alt={alt}
      loading={priority?"eager":"lazy"}
      fetchPriority={priority?"high":"auto"}
      decoding="async"
      draggable={false}
      onError={optimized?()=>setFailed(true):undefined}
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
