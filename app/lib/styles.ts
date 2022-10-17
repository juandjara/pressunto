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
  'dark:bg-slate-800',
  'placeholder:text-slate-400',
  'dark:placeholder:text-slate-300',
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

export const labelCN = 'text-slate-500 dark:text-slate-100 text-sm'

const buttonCommon = [
  'rounded-md',
  'font-medium',
  'disabled:opacity-50',
].join(' ')

export const buttonCN = {
  small: `px-2 py-1 text-sm ${buttonCommon}`,
  normal: `px-4 py-2 ${buttonCommon}`,
  big: `px-5 py-3 text-lg ${buttonCommon}`,
  slate: [
    'text-slate-100 bg-slate-600 hover:bg-slate-900',
    'dark:text-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200'
  ].join(' '),
  iconLeft: 'flex items-center gap-2 pl-2',
  cancel: 'hover:bg-slate-100 dark:hover:bg-slate-100/25',
  delete: 'text-red-700 hover:bg-red-50'
}

export const borderColor = 'border-gray-200 dark:border-gray-600'
