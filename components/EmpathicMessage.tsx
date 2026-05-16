export default function EmpathicMessage({ text }: { text: string }) {
  return (
    <p className="max-w-[60ch] mx-auto text-2xl leading-relaxed text-ink-soft text-center my-8 font-display">
      {text}
    </p>
  );
}
