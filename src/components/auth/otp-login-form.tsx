"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { setPendingOtpContact } from "@/lib/store/slices/authSlice";
import { useAppDispatch } from "@/lib/store";
import { normalizeAuthInput } from "@/lib/auth/contact";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OtpLoginFormProps = {
    redirect?: string;
};

type LoginFormValues = {
    authInput: string;
};

export function OtpLoginForm({ redirect }: OtpLoginFormProps) {
    const [error, setError] = useState<string | null>(null);
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
        mutationFn: async (payload: { channel: "email" | "phone"; identifier: string }) => {
            await api.post(endpoints.auth.sendOtp, payload);
        },
        onSuccess: (_, variables) => {
            dispatch(
                setPendingOtpContact({
                    channel: variables.channel,
                    identifier: variables.identifier,
                })
            );

            const query = new URLSearchParams({
                channel: variables.channel,
                identifier: variables.identifier,
                redirect: redirect ?? "/dashboard",
            });
            router.push(`/verify?${query.toString()}`);
        },
        onError: () => {
            setError("ارسال کد تایید با خطا مواجه شد. لطفا دوباره تلاش کنید.");
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        setError(null);

        const normalized = normalizeAuthInput(values.authInput);
        if (!normalized.channel) {
            setError("ایمیل یا شماره موبایل معتبر وارد کنید.");
            return;
        }

        await sendOtp.mutateAsync({
            channel: normalized.channel,
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

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <Button className="w-full text-gray-50" type="submit" disabled={sendOtp.isPending}>
                        {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد تایید"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
