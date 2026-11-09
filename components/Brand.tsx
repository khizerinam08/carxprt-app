import src from "./brand-src.json";

export function Logo({ mark = false }: { mark?: boolean }) {
  return (
    <svg className={mark ? "logo-mark" : "logo"} viewBox={mark ? "0 0 15.68 15.68" : "0 0 73 16"} role="img" aria-label="CarXprt"
      dangerouslySetInnerHTML={{ __html: mark ? src.mark : `${src.mark}<g transform="translate(19.4 1.9)">${src.word}</g>` }} />
  );
}

export function HatGlasses({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: src.hat }} />;
}
