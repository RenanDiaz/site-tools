import { useState, useEffect } from "react";

export function useRevertableState<T>(
  initialValue: T,
  revertDuration: number
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    let revertTimeout: ReturnType<typeof setTimeout>;

    if (value !== initialValue) {
      revertTimeout = setTimeout(() => {
        setValue(initialValue);
      }, revertDuration);
    }

    return () => {
      clearTimeout(revertTimeout);
    };
  }, [value, initialValue, revertDuration]);

  return [value, setValue];
}
