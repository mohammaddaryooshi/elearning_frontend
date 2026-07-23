"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { clearPendingOtpContact, setUser } from "@/lib/store/slices/authSlice";
import { useAppDispatch } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import type { AuthChannel, AuthResponse } from "@/types";

type RegisterFormValues = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
};

type RegisterFormProps = {
    channel: AuthChannel;
    identifier: string;
    redirect?: string;
};

export function RegisterForm({ channel, identifier, redirect }: RegisterFormProps) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const safeRedirect = useMemo(() => getSafeRedirectPath(redirect), [redirect]);

    const lockedPhone = channel === "phone" ? identifier : "";
    const lockedEmail = channel === "email" ? identifier : "";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: lockedPhone,
            email: lockedEmail,
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (payload: RegisterFormValues) => {
            return api.post<AuthResponse>(endpoints.auth.register, {
                firstName: payload.firstName.trim(),
                lastName: payload.lastName.trim(),
                phone: payload.phone.trim(),
                email: payload.email.trim().toLowerCase(),
                channel,
                identifier,
            });
        },
        onSuccess: (response) => {
            dispatch(setUser(response.data.user));
            dispatch(clearPendingOtpContact());
            router.push(safeRedirect);
        },
        onError: () => {
            setError("ثبت نام انجام نشد. لطفا اطلاعات را بررسی و دوباره تلاش کنید.");
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        setError(null);

        const payload: RegisterFormValues = {
            firstName: values.firstName,
            lastName: values.lastName,
            phone: channel === "phone" ? identifier : values.phone,
            email: channel === "email" ? identifier : values.email,
        };

        await registerMutation.mutateAsync(payload);
    });

    return (
        <Card className="mx-auto w-full max-w-lg">
            <CardHeader>
                <CardTitle>تکمیل ثبت نام</CardTitle>
                <CardDescription>
                    شناسه تایید شده شما {identifier} است و قابل تغییر نیست.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">نام</Label>
                            <Input
                                id="firstName"
                                autoComplete="given-name"
                                {...register("firstName", {
                                    required: "وارد کردن نام الزامی است.",
                                    minLength: {
                                        value: 2,
                                        message: "نام باید حداقل 2 کاراکتر باشد.",
                                    },
                                    maxLength: {
                                        value: 40,
                                        message: "نام بیش از حد طولانی است.",
                                    },
                                })}
                            />
                            {errors.firstName ? (
                                <p className="text-sm text-red-600">{errors.firstName.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">نام خانوادگی</Label>
                            <Input
                                id="lastName"
                                autoComplete="family-name"
                                {...register("lastName", {
                                    required: "وارد کردن نام خانوادگی الزامی است.",
                                    minLength: {
                                        value: 2,
                                        message: "نام خانوادگی باید حداقل 2 کاراکتر باشد.",
                                    },
                                    maxLength: {
                                        value: 60,
                                        message: "نام خانوادگی بیش از حد طولانی است.",
                                    },
                                })}
                            />
                            {errors.lastName ? (
                                <p className="text-sm text-red-600">{errors.lastName.message}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">تلفن همراه</Label>
                        <Input
                            id="phone"
                            autoComplete="tel"
                            readOnly={channel === "phone"}
                            className={channel === "phone" ? "bg-muted" : undefined}
                            {...register("phone", {
                                required: "وارد کردن تلفن همراه الزامی است.",
                                pattern: {
                                    value: /^09\d{9}$/,
                                    message: "شماره تلفن همراه معتبر نیست.",
                                },
                            })}
                        />
                        {errors.phone ? (
                            <p className="text-sm text-red-600">{errors.phone.message}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">ایمیل</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            readOnly={channel === "email"}
                            className={channel === "email" ? "bg-muted" : undefined}
                            {...register("email", {
                                required: "وارد کردن ایمیل الزامی است.",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "ایمیل معتبر نیست.",
                                },
                                maxLength: {
                                    value: 120,
                                    message: "ایمیل بیش از حد طولانی است.",
                                },
                            })}
                        />
                        {errors.email ? (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        ) : null}
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? "در حال ثبت نام..." : "ثبت نام"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
