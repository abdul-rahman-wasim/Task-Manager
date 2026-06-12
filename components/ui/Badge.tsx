type Color = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'

interface BadgeProps {
  color?: Color
  children: React.ReactNode
}

const colorClass: Record<Color, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

export function Badge({ color = 'gray', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass[color]}`}>
      {children}
    </span>
  )
}
