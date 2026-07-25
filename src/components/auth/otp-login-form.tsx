"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { setPendingOtpContact, setUser } from "@/lib/store/slices/authSlice";
import { useAppDispatch } from "@/lib/store";
import { normalizeAuthInput } from "@/lib/auth/contact";
import { showBackendError } from "@/lib/api/error-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RequestOtpResult, RequestOtpResponse } from "@/types";

type OtpLoginFormProps = {
    redirect?: string;
};

type LoginFormValues = {
    authInput: string;
};

export function OtpLoginForm({ redirect }: OtpLoginFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        defaultValues: {
            authInput: "",
        },
    });

    const sendOtp = useMutation({
        mutationFn: async (payload: { identifier: string }) => {
            const response = await api.post<RequestOtpResult>(endpoints.auth.sendOtp, {
                identifier: payload.identifier,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            if ("authenticated" in data && data.authenticated) {
                dispatch(setUser(data.user));
                router.push(redirect ?? "/dashboard");
                return;
            }

            const otpResponse = data as RequestOtpResponse;

            dispatch(
                setPendingOtpContact({
                    identifier: variables.identifier,
                })
            );

            const query = new URLSearchParams({
                identifier: variables.identifier,
                identifier_type: otpResponse.identifier_type,
                redirect: redirect ?? "/dashboard",
            });
            router.push(`/verify?${query.toString()}`);
        },
        onError: (error) => {
            showBackendError(error);
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        const normalized = normalizeAuthInput(values.authInput);
        if (!normalized.channel) {
            return;
        }

        await sendOtp.mutateAsync({
            identifier: normalized.identifier,
        });
    });

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-extrabold">ورود یا ثبت نام</CardTitle>
                <CardDescription className="pt-6">ایمیل یا شماره موبایل خود را وارد کنید تا کد تایید ارسال شود.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="authInput">ایمیل یا شماره موبایل</Label>
                        <Input
                            id="authInput"
                            placeholder="example@mail.com یا 09121234567"
                            autoComplete="username"
                            inputMode="email"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            {...register("authInput", {
                                required: "وارد کردن ایمیل یا شماره موبایل الزامی است.",
                                minLength: {
                                    value: 6,
                                    message: "مقدار وارد شده معتبر نیست.",
                                },
                                maxLength: {
                                    value: 80,
                                    message: "مقدار وارد شده بیش از حد طولانی است.",
                                },
                            })}
                        />
                        {errors.authInput ? (
                            <p className="text-sm text-red-600">{errors.authInput.message}</p>
                        ) : null}
                    </div>

                    <Button className="w-full text-gray-50" type="submit" disabled={sendOtp.isPending}>
                        {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد تایید"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
