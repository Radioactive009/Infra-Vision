"use client";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden -mt-16">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/infravision_intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Optional overlay for visual contrast */}
      <div className="absolute inset-0 bg-black/20"></div>
    </div>
  );
}





