"use client"

import { useForm, UseFormRegisterReturn } from "react-hook-form"

export interface LifeEvent {
  startDate: Date
  endDate?: Date
  title: string
  description: string
}

interface FormInputProps {
  type: "text" | "date"
  placeholder: string
  registration: UseFormRegisterReturn
}

const INPUT_CLASS =
  "outline-none text-sm border-b text-stone-500 border-transparent hover:border-stone-300 focus:border-stone-500 transition-colors bg-transparent"

const FormInput = ({ type, placeholder, registration }: FormInputProps) => (
  <input
    type={type}
    placeholder={placeholder}
    className={INPUT_CLASS}
    {...registration}
  />
)

interface LifeEventInputProps {
  onSubmit: (data: LifeEvent) => void
}

export const LifeEventInput = ({ onSubmit }: LifeEventInputProps) => {
  const { register, handleSubmit } = useForm<LifeEvent>()

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 text-sm"
    >
      <div className="flex flex-row gap-2 w-80 mx-auto pt-1">
        <FormInput
          type="date"
          placeholder="Start date"
          registration={register("startDate", { valueAsDate: true, required: true })}
        />
        -
        <FormInput
          type="date"
          placeholder="End date"
          registration={register("endDate", {
            setValueAs: (v: string) => (v ? new Date(v) : undefined),
          })}
        />
      </div>
      <FormInput
        type="text"
        placeholder="Life event"
        registration={register("title")}
      />
      <FormInput
        type="text"
        placeholder="Add more detail here"
        registration={register("description")}
      />
      <button
        type="submit"
        className="text-xs border border-stone-300 rounded-md px-2 py-1 hover:bg-stone-100 transition-colors"
      >
        Save
      </button>
    </form>
  )
}
