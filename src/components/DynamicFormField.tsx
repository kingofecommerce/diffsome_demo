import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FormField } from "@/types/form";

interface DynamicFormFieldProps {
  field: FormField;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  error?: string;
}

export const DynamicFormField = ({
  field,
  value,
  onChange,
  error,
}: DynamicFormFieldProps) => {
  const { name, label, type, required, placeholder, options } = field;

  const renderField = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            id={name}
            name={name}
            value={(value as string) || ""}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={error ? "border-destructive" : ""}
            rows={5}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={(val) => onChange(name, val)}
          >
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder={placeholder || "선택하세요"} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => onChange(name, checked)}
            />
            <Label htmlFor={name} className="text-sm font-normal">
              {placeholder || label}
            </Label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={(val) => onChange(name, val)}
          >
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <Label htmlFor={`${name}-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "email":
        return (
          <Input
            id={name}
            name={name}
            type="email"
            value={(value as string) || ""}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={error ? "border-destructive" : ""}
          />
        );

      default:
        return (
          <Input
            id={name}
            name={name}
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={error ? "border-destructive" : ""}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {type !== "checkbox" && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
