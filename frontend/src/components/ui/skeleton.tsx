import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-linear-to-r from-[#f1f5f9] via-[#e2e8f0] to-[#f1f5f9] bg-[length:200%_100%] animate-shimmer rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
