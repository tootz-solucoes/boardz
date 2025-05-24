export default function LembrettzBadge({ children, pulse }) {
  return <span className={`badge${pulse ? " pulse" : ""}`}>{children}</span>;
}
