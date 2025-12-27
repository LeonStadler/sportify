import { useEffect, useMemo, useState } from "react";

const SHIFT = 3;

const encodeValue = (value: string) =>
  value
    .split("")
    .map((char) => char.charCodeAt(0) + SHIFT)
    .join("-");

const decodeValue = (encoded: string) =>
  encoded
    .split("-")
    .filter(Boolean)
    .map((code) => String.fromCharCode(Number(code) - SHIFT))
    .join("");

type TextElement = "span" | "div" | "p";

interface ObfuscatedTextProps {
  value: string;
  className?: string;
  as?: TextElement;
  hrefPrefix?: string;
  hrefValue?: string;
}

export function ObfuscatedText({
  value,
  className,
  as = "span",
  hrefPrefix,
  hrefValue,
}: ObfuscatedTextProps) {
  const encodedDisplay = useMemo(() => encodeValue(value), [value]);
  const encodedHref = useMemo(
    () => encodeValue(hrefValue ?? value),
    [hrefValue, value]
  );
  const [decoded, setDecoded] = useState("");
  const [decodedHref, setDecodedHref] = useState("");

  useEffect(() => {
    if (!encodedDisplay) {
      setDecoded("");
      setDecodedHref("");
      return;
    }
    setDecoded(decodeValue(encodedDisplay));
    setDecodedHref(decodeValue(encodedHref));
  }, [encodedDisplay, encodedHref]);

  if (!value) {
    return null;
  }

  if (hrefPrefix) {
    return (
      <a
        href={decodedHref ? `${hrefPrefix}${decodedHref}` : undefined}
        className={className}
      >
        {decoded}
      </a>
    );
  }

  const Component = as;
  return <Component className={className}>{decoded}</Component>;
}
