export default function InlineCode({ children, ...props }: { children: React.ReactNode }) {
  return <code className="bg-rose-50 text-rose-900 dark:text-rose-100 dark:bg-rose-500/25 rounded-md px-1" {...props}>{children}</code>
}
