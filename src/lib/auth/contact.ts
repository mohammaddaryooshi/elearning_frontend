import type { AuthChannel, PendingOtpContact } from "@/features/auth/types";

const PHONE_REGEX = /^09\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeIdentifier(value: string) {
    return value.trim().toLowerCase();
}

export function detectAuthChannel(value: string): AuthChannel | null {
    const normalized = normalizeIdentifier(value);

    if (PHONE_REGEX.test(normalized)) {
        return "phone";
    }

    if (EMAIL_REGEX.test(normalized)) {
        return "email";
    }

    return null;
}

export function isValidIdentifierForChannel(
    channel: AuthChannel,
    identifier: string
) {
    const normalized = normalizeIdentifier(identifier);
    return channel === "phone"
        ? PHONE_REGEX.test(normalized)
        : EMAIL_REGEX.test(normalized);
}

export function sanitizePendingOtpContact(input: {
    identifier?: string | null;
}): PendingOtpContact | null {
    if (!input.identifier) {
        return null;
    }

    const identifier = normalizeIdentifier(input.identifier);
    const channel = detectAuthChannel(identifier);

    if (!channel) {
        return null;
    }

    return { identifier };
}

export function normalizeAuthInput(value: string) {
    const identifier = normalizeIdentifier(value);
    const channel = detectAuthChannel(identifier);

    return {
        identifier,
        channel,
    };
}
