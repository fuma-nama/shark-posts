import { Fragment, type ReactNode } from "react";
import { Dialog as Base, Transition } from "@headlessui/react";
import { tv, type VariantProps } from "tailwind-variants";

const dialog = tv({
  slots: {
    panel:
      "w-full transform overflow-hidden rounded-2xl bg-slate-900 p-5 text-left align-middle shadow-xl transition-all",
  },
  variants: {
    size: {
      md: {
        panel: "max-w-xl",
      },
      lg: {
        panel: "max-w-screen-sm",
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export type DialogProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
} & VariantProps<typeof dialog>;

export function Dialog({
  open,
  setOpen,
  title,
  description,
  children,
  size,
}: DialogProps) {
  const styles = dialog({ size });

  return (
    <Transition appear show={open} as={Fragment}>
      <Base as="div" className="relative z-10" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Base.Panel className={styles.panel()}>
                {title != null && (
                  <Base.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    {title}
                  </Base.Title>
                )}
                {description != null && (
                  <p className="mt-2 text-sm text-gray-400">{description}</p>
                )}

                {children}
              </Base.Panel>
            </Transition.Child>
          </div>
        </div>
      </Base>
    </Transition>
  );
}
