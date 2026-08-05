export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  ...props
}) {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border bg-white/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
            : "border-slate-200 focus:border-ocean-500 focus:ring-ocean-100"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-100" : ""}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600 font-medium pl-1">{error}</span>}
    </div>
  );
}
