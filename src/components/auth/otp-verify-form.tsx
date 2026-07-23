"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { clearPendingOtpContact, setUser } from "@/lib/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizePendingOtpContact } from "@/lib/auth/contact";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import type { OtpVerifyResponse } from "@/types";

const OTP_LENGTH = 6;

function normalizeOtpDigits(value: string) {
    return value
        .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776))
        .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1584))
        .replace(/\D/g, "");
}

export function OtpVerifyForm() {
    const [error, setError] = useState<string | null>(null);
    const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const pendingOtpContact = useAppSelector(
        (state) => state.auth.pendingOtpContact
    );
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const otpContact = useMemo(
        () =>
            sanitizePendingOtpContact({
                channel: searchParams.get("channel") ?? pendingOtpContact?.channel,
                identifier:
                    searchParams.get("identifier") ?? pendingOtpContact?.identifier,
            }),
        [pendingOtpContact, searchParams]
    );
    const redirectPath = useMemo(
        () => getSafeRedirectPath(searchParams.get("redirect")),
        [searchParams]
    );

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const otpCode = digits.join("");
    const filledDigitsCount = digits.filter((digit) => digit.length === 1).length;
    const isOtpComplete = filledDigitsCount === OTP_LENGTH;

    const updateDigit = (index: number, value: string) => {
        setDigits((currentDigits) => {
            const nextDigits = [...currentDigits];
            nextDigits[index] = value;
            return nextDigits;
        });
        setError(null);
    };

    const setDigitsFromValue = (startIndex: number, rawValue: string) => {
        const sanitizedDigits = normalizeOtpDigits(rawValue)
            .slice(0, OTP_LENGTH - startIndex)
            .split("");

        if (!sanitizedDigits.length) {
            updateDigit(startIndex, "");
            return;
        }

        setDigits((currentDigits) => {
            const nextDigits = [...currentDigits];
            sanitizedDigits.forEach((digit, offset) => {
                nextDigits[startIndex + offset] = digit;
            });
            return nextDigits;
        });
        setError(null);

        const nextFocusIndex = Math.min(startIndex + sanitizedDigits.length, OTP_LENGTH - 1);
        const focusTarget =
            nextFocusIndex < OTP_LENGTH - 1 ? nextFocusIndex + 1 : nextFocusIndex;

        if (focusTarget < OTP_LENGTH) {
            inputRefs.current[focusTarget]?.focus();
            inputRefs.current[focusTarget]?.select();
        }
    };

    const handleDigitChange = (index: number, rawValue: string) => {
        const value = normalizeOtpDigits(rawValue);

        if (!value) {
            updateDigit(index, "");
            return;
        }

        if (value.length > 1) {
            setDigitsFromValue(index, value);
            return;
        }

        updateDigit(index, value);

        if (index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
            inputRefs.current[index + 1]?.select();
        }
    };

    const handleDigitKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Backspace") {
            event.preventDefault();

            if (digits[index]) {
                updateDigit(index, "");
                return;
            }

            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                updateDigit(index - 1, "");
            }
        }

        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            event.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        const pasted = normalizeOtpDigits(event.clipboardData.getData("text")).slice(0, OTP_LENGTH);
        if (!pasted) {
            return;
        }

        event.preventDefault();
        const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? "");
        setDigits(nextDigits);
        setError(null);
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const verifyOtp = useMutation({
        mutationFn: async (code: string) => {
            if (!otpContact) {
                throw new Error("Invalid OTP context");
            }

            const response = await api.post<OtpVerifyResponse>(endpoints.auth.verifyOtp, {
                channel: otpContact.channel,
                identifier: otpContact.identifier,
                code,
            });
            return response.data;
        },
        onSuccess: (data) => {
            const isRegistered =
                data.isRegistered ??
                (typeof data.requiresRegistration === "boolean"
                    ? !data.requiresRegistration
                    : Boolean(data.user));

            if (data.user && isRegistered) {
                dispatch(setUser(data.user));
                dispatch(clearPendingOtpContact());
                router.push(redirectPath);
                return;
            }

            if (!otpContact) {
                setError("فرآیند تایید نامعتبر است. دوباره تلاش کنید.");
                return;
            }

            const query = new URLSearchParams({
                channel: otpContact.channel,
                identifier: otpContact.identifier,
                redirect: redirectPath,
            });
            router.push(`/register?${query.toString()}`);
        },
        onError: () => {
            setError("کد تایید معتبر نیست یا منقضی شده است.");
        },
    });

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!otpContact) {
            setError("اطلاعات ورود ناقص است. لطفا دوباره اقدام کنید.");
            router.replace("/login");
            return;
        }

        if (!isOtpComplete) {
            setError("کد تایید را کامل وارد کنید.");
            return;
        }

        await verifyOtp.mutateAsync(otpCode);
    };
    console.log({ otpContact, isOtpComplete, digits });

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader>
                <CardTitle>تایید کد</CardTitle>
                <CardDescription>
                    کد ارسال شده به {otpContact?.identifier ?? "شناسه نامعتبر"} را وارد کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="code">کد تایید</Label>
                        <div
                            dir="ltr"
                            className="flex items-center justify-center gap-2"
                            onPaste={handlePaste}
                        >
                            {digits.map((digit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        ref={(element) => {
                                            inputRefs.current[index] = element;
                                        }}
                                        id={index === 0 ? "code" : undefined}
                                        name={index === 0 ? "one-time-code" : `otp-${index + 1}`}
                                        value={digit}
                                        onChange={(event) =>
                                            handleDigitChange(index, event.target.value)
                                        }
                                        onKeyDown={(event) => handleDigitKeyDown(index, event)}
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete={index === 0 ? "one-time-code" : "off"}
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        enterKeyHint={index === OTP_LENGTH - 1 ? "done" : "next"}
                                        aria-label={`رقم ${index + 1} کد تایید`}
                                        className="h-12 w-10 rounded-lg px-0 text-center text-lg font-semibold sm:h-12 sm:w-11"
                                    />
                                    {index < OTP_LENGTH - 1 ? (
                                        <span
                                            aria-hidden="true"
                                            className="select-none text-lg text-muted-foreground"
                                        >
                                            -
                                        </span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <Button
                        className="w-full"
                        type="submit"
                        disabled={!otpContact || !isOtpComplete || verifyOtp.isPending}
                    >
                        {verifyOtp.isPending ? "در حال بررسی..." : "تایید"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
