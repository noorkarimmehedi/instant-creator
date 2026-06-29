export default function Loading() {
  return (
    <div className="flex h-20 w-20 items-center justify-center" role="status" aria-label="Opening dashboard">
      <div className="relative h-14 w-14">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-[1.625rem] rounded-full bg-ink opacity-20 motion-safe:animate-[spinner-fade_1.2s_linear_infinite] dark:bg-mute"
            style={{
              animationDelay: `${index * 0.1}s`,
              transform: `translateX(-50%) rotate(${index * 30}deg) translateY(-1.625rem)`,
              transformOrigin: "50% 1.625rem",
            }}
          />
        ))}
      </div>
      <span className="sr-only">Opening dashboard</span>
    </div>
  );
}
