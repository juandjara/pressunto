export const focusCN = [
  `focus:border-slate-300`,
  'focus:ring',
  `focus:ring-slate-200`,
  'focus:ring-opacity-50',
  'focus:ring-offset-0'
].join(' ')

export const focusWithinCN = [
  'focus-within:ring',
  'focus-within:ring-slate-200',
  'focus-within:ring-opacity-50',
  'focus-within:ring-offset-0'
].join(' ')

export const inputCN = [
  'block',
  'w-full',
  'rounded-md',
  'shadow-sm',
  'disabled:opacity-50',
  'border',
  'border-gray-300',
  'dark:border-gray-500',
  'text-slate-700',
  'dark:text-slate-100',
  'bg-white',
  'dark:bg-slate-800',
  'placeholder:text-slate-400',
  'dark:placeholder:text-slate-500',
  focusCN
].join(' ')

export const checkboxCN = [
  'rounded',
  `text-slate-600`,
  'border-gray-300',
  'shadow-sm',
  'disabled:opacity-50',
  focusCN
].join(' ')

export const labelCN = 'mb-1 block text-slate-500 dark:text-slate-100 text-sm'

const buttonCommon = [
  'rounded-md',
  'font-medium',
  'disabled:opacity-50',
  'disabled:pointer-events-none',
  'aria-disabled:opacity-50',
  'aria-disabled:pointer-events-none',
].join(' ')

export const buttonCN = {
  common: buttonCommon,
  small: `px-2 py-1 text-sm ${buttonCommon}`,
  normal: `px-4 py-2 ${buttonCommon}`,
  big: `px-5 py-3 text-lg ${buttonCommon}`,
  slate: [
    'text-slate-100 bg-slate-600 hover:bg-slate-900',
    'dark:text-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200'
  ].join(' '),
  icon: 'pr-2 pl-2',
  iconLeft: 'flex items-center gap-2 pl-2',
  iconLeftWide: 'flex items-center gap-3 pl-3',
  iconRight: 'flex items-center gap-2',
  cancel: 'hover:bg-slate-100 dark:hover:bg-slate-100/25',
  delete: 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/20',
  deleteBold: 'bg-red-700 hover:bg-red-800 text-white'
}

export const borderColor = 'border-gray-200 dark:border-gray-600'

const iconColor = 'text-slate-400 dark:text-slate-400'
export const iconCN = {
  big: `w-6 h-6 ${iconColor}`,
  small: `w-5 h-5 ${iconColor}`,
}
