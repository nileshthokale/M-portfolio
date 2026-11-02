import { SkillCategoryItem } from '../data/portfolio';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    email?: string;
    message?: string;
  };
}

/**
 * Pure validation function for the portfolio Contact form.
 * Never substitutes fallback values when required inputs are empty or invalid.
 */
export function validateContactForm(input: ContactPayload): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const trimmedName = (input.name || '').trim();
  const trimmedEmail = (input.email || '').trim();
  const trimmedMessage = (input.message || '').trim();

  if (!trimmedName) {
    errors.name = 'Full name is required.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!trimmedMessage) {
    errors.message = 'Project brief or message is required.';
  } else if (trimmedMessage.length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Pure helper to filter resume skill categories by category ID ('all' or specific id).
 */
export function filterSkillCategories(
  categories: SkillCategoryItem[],
  selectedId: string
): SkillCategoryItem[] {
  if (!selectedId || selectedId === 'all') {
    return categories;
  }
  return categories.filter((c) => c.id === selectedId);
}

/**
 * Resolves the next project in circular order for the `/projects/[slug]` detail view.
 */
export function getNextProjectSlug(slugs: string[], currentSlug: string): string {
  if (slugs.length === 0) return '';
  const idx = slugs.indexOf(currentSlug);
  if (idx === -1) return slugs[0];
  return slugs[(idx + 1) % slugs.length];
}
