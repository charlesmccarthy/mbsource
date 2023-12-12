import clsx from "clsx";

export function Button({ className, bgAccent = "slate", ...props }: any) {
  const bgColor = `bg-${bgAccent}-600 hover:bg-${bgAccent}-700 active:bg-${bgAccent}-700`;
  return (
    <button
      className={clsx(
        className,
        "inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm outline-offset-2 transition active:transition-none",
        "font-semibold text-zinc-100 active:text-zinc-100/70 ",
        bgColor
      )}
      {...props}
    />
  );
}
