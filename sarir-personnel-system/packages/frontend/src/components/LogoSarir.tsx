export default function LogoSarir({
  className,
  width = 180,
  height = 60,
}: { className?: string; width?: number; height?: number }) {
  return (
    <img
      src="/images/Logo-Sarir.png"
      alt="لوگو سریر"
      width={width}
      height={height}
      className={["select-none object-contain", className || ""].join(" ")}
      draggable={false}
    />
  );
}
