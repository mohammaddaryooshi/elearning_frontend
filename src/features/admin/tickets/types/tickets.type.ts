export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
    | "technical"
    | "billing"
    | "course"
    | "account"
    | "other";

export interface TicketMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: "user" | "admin";
    body: string;
    created_at: string;
}

export interface AdminTicketRow {
    id: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    user_id: string;
    user_name: string;
    user_email: string;
    assigned_to?: string | null;
    messages_count: number;
    last_message_at: string;
    created_at: string;
}

export interface TicketDetail extends AdminTicketRow {
    messages: TicketMessage[];
}

export interface CreateTicketDto {
    subject: string;
    body: string;
    priority: TicketPriority;
    category: TicketCategory;
    user_id: string;
}

export interface ReplyTicketDto {
    body: string;
}

export interface UpdateTicketDto {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigned_to?: string;
}
