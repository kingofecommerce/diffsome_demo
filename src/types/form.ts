export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  submit_button_text: string;
  success_message: string;
  fields: FormField[];
  is_active: boolean;
  created_at: string;
}

export interface FormSubmitResponse {
  success: boolean;
  message: string;
  submission_id?: number;
}

export interface FormListResponse {
  success: boolean;
  data: FormData[];
}

export interface FormDetailResponse {
  success: boolean;
  data: FormData;
}
