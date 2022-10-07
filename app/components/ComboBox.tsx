import type { MutableRefObject } from 'react'
import { Fragment } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Spinner from './Spinner'
import { inputCN, focusWithinCN } from '@/lib/styles'

type ComboBoxProps<T> = {
  inputRef: MutableRefObject<HTMLInputElement | null>,
  name: string
  loading: boolean
  options: T[]
  onSelect?: (opt: string) => void
  onSearch: (q: string) => void
  labelKey: keyof T
  valueKey: keyof T
}

export default function ComboBox<T>({
  inputRef,
  name,
  loading,
  options,
  onSearch,
  onSelect,
  labelKey,
  valueKey
}: ComboBoxProps<T>) {
  return (
    <Combobox name={name} onChange={onSelect}>
      <div className="relative mt-1">
        <div className={`${inputCN} ${focusWithinCN}`}>
          <Combobox.Input
            ref={inputRef}
            className="w-full bg-transparent border-none pr-10 focus:ring-0"
            onChange={(event) => onSearch(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            {loading ? (
              <Spinner />
            ) : (
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            )}
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => onSearch('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.length === 0 && !loading ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              options.map((opt) => (
                <Combobox.Option
                  key={String(opt[valueKey])}
                  className={({ active }) => [
                    'relative cursor-default select-none py-2 pl-10 pr-4',
                    active ? 'bg-slate-200' : ''
                  ].join(' ')}
                  value={opt[valueKey]}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {String(opt[labelKey])}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-slate-600'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}
