// validationUtil.ts
export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateAmount(value: string): ValidationResult {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Amount is required" };
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed <= 0) {
    return { valid: false, message: "Amount must be a positive number" };
  }
  return { valid: true };
}

export function validateAccount(accountId: number | null): ValidationResult {
  if (!accountId) {
    return { valid: false, message: "Please select an account" };
  }
  return { valid: true };
}

export function validateCategory(category: any | null): ValidationResult {
  if (!category) {
    return { valid: false, message: "Please select a category" };
  }
  return { valid: true };
}
