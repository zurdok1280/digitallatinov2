import { Check, X } from 'lucide-react';

const Requirement = ({ met, text }) => (
  <li className={`flex items-center gap-2 text-sm transition-colors ${met ? 'text-[#8c52ff]' : 'text-gray-400'}`}>
    {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    <span>{text}</span>
  </li>
);

export function PasswordStrength({ password_string }) {
  const has_length = password_string.length >= 10;
  const has_uppercase = /[A-Z]/.test(password_string);
  const has_number = /[0-9]/.test(password_string);
  const has_symbol = /[^A-Za-z0-9]/.test(password_string);

  return (
    <ul className="space-y-1 mt-2 p-3 bg-white/5 backdrop-blur-md rounded-md border border-white/10">
      <Requirement met={has_length} text="Mínimo 10 caracteres" />
      <Requirement met={has_uppercase} text="Al menos una mayúscula" />
      <Requirement met={has_number} text="Al menos un número" />
      <Requirement met={has_symbol} text="Al menos un símbolo" />
    </ul>
  );
}
