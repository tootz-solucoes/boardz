export default function LembrettzBadge({ children, pulse, className = "" }) {
  const classes = ["badge"];
  if (pulse) classes.push("pulse");
  if (className) classes.push(className);
  return <span className={classes.join(" ")}>{children}</span>;
}
