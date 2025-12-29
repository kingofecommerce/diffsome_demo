import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicFormField } from "@/components/DynamicFormField";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useForm } from "@/hooks/useForm";
import { useSubmitForm } from "@/hooks/useSubmitForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

const CONTACT_FORM_SLUG = "ask"; // API에서 사용하는 폼 슬러그

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: formData, isLoading, error } = useForm(CONTACT_FORM_SLUG);
  const submitForm = useSubmitForm();

  const handleFieldChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // 값이 변경되면 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData?.fields) return false;

    const newErrors: Record<string, string> = {};

    formData.fields.forEach((field) => {
      const value = formValues[field.name];

      if (field.required) {
        if (value === undefined || value === null || value === "") {
          newErrors[field.name] = `${field.label}은(는) 필수입니다.`;
        }
      }

      if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value as string)) {
          newErrors[field.name] = "올바른 이메일 형식이 아닙니다.";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 확인해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const submitData = {
        ...formValues,
        ...(user?.id && { member_id: user.id }),
      };

      await submitForm.mutateAsync({
        slug: CONTACT_FORM_SLUG,
        data: submitData,
        token,
      });

      setIsSubmitted(true);
      toast({
        title: "문의 접수 완료",
        description: formData?.success_message || "문의가 성공적으로 접수되었습니다.",
      });
    } catch (err) {
      toast({
        title: "제출 실패",
        description: err instanceof Error ? err.message : "문의 제출에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <LoadingState />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <ErrorState message="문의 폼을 불러오는데 실패했습니다." onRetry={() => window.location.reload()} />
        </main>
        <Footer />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-lg text-center animate-fade-in">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">문의 접수 완료</h2>
              <p className="text-muted-foreground mb-6">
                {formData?.success_message || "문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다."}
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>

          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-2xl">{formData?.name || "문의하기"}</CardTitle>
              {formData?.description && (
                <CardDescription>{formData.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {formData?.fields?.map((field) => (
                  <DynamicFormField
                    key={field.name}
                    field={field}
                    value={formValues[field.name]}
                    onChange={handleFieldChange}
                    error={errors[field.name]}
                  />
                ))}

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={submitForm.isPending}
                    className="min-w-[120px]"
                  >
                    {submitForm.isPending ? (
                      "제출 중..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {formData?.submit_button_text || "제출하기"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
