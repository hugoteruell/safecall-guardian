export default function EmpathicMessage({ text }: { text: string }) {
  return (
    <p className="max-w-[60ch] mx-auto text-2xl leading-relaxed text-slate-800 text-center my-8">
      {text}
    </p>
  );
}
