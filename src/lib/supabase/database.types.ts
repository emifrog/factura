/**
 * Types de la base Factura.
 * Écrits à la main pour l'instant ; à terme, régénérer via :
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */
export type CompanyLegalForm = "EI" | "micro" | "EURL" | "SASU";
export type CompanyVatRegime = "franchise" | "reel_simplifie" | "reel_normal";
export type ClientKind = "b2b" | "b2c" | "international";
export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";
export type InvoiceCategory = "goods" | "services" | "mixed";
export type QuoteStatus = "draft" | "sent" | "accepted" | "refused" | "expired";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string | null;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          confirmation_token: string;
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          source?: string | null;
        };
        Update: {
          confirmed_at?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          profile_id: string;
          legal_name: string;
          siren: string | null;
          legal_form: CompanyLegalForm;
          vat_regime: CompanyVatRegime;
          vat_number: string | null;
          vat_on_debits: boolean;
          address_line1: string | null;
          address_line2: string | null;
          postal_code: string | null;
          city: string | null;
          country: string;
          iban: string | null;
          logo_path: string | null;
          reminder_enabled: boolean;
          reminder_signature: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          legal_name: string;
          siren?: string | null;
          legal_form: CompanyLegalForm;
          vat_regime: CompanyVatRegime;
          vat_number?: string | null;
          vat_on_debits?: boolean;
          address_line1?: string | null;
          address_line2?: string | null;
          postal_code?: string | null;
          city?: string | null;
          country?: string;
          iban?: string | null;
          logo_path?: string | null;
          reminder_enabled?: boolean;
          reminder_signature?: string | null;
        };
        Update: Partial<{
          legal_name: string;
          siren: string | null;
          legal_form: CompanyLegalForm;
          vat_regime: CompanyVatRegime;
          vat_number: string | null;
          vat_on_debits: boolean;
          address_line1: string | null;
          address_line2: string | null;
          postal_code: string | null;
          city: string | null;
          country: string;
          iban: string | null;
          logo_path: string | null;
          reminder_enabled: boolean;
          reminder_signature: string | null;
        }>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          profile_id: string;
          kind: ClientKind;
          name: string;
          siren: string | null;
          vat_number: string | null;
          email: string | null;
          address_line1: string | null;
          address_line2: string | null;
          postal_code: string | null;
          city: string | null;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          kind: ClientKind;
          name: string;
          siren?: string | null;
          vat_number?: string | null;
          email?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          postal_code?: string | null;
          city?: string | null;
          country?: string;
        };
        Update: Partial<{
          kind: ClientKind;
          name: string;
          siren: string | null;
          vat_number: string | null;
          email: string | null;
          address_line1: string | null;
          address_line2: string | null;
          postal_code: string | null;
          city: string | null;
          country: string;
        }>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          profile_id: string;
          client_id: string | null;
          number: string | null;
          status: InvoiceStatus;
          category: InvoiceCategory;
          issue_date: string | null;
          due_date: string | null;
          currency: string;
          vat_on_debits: boolean;
          line_total: number;
          tax_total: number;
          grand_total: number;
          seller_snapshot: Json | null;
          buyer_snapshot: Json | null;
          pdf_path: string | null;
          xml_path: string | null;
          sha256: string | null;
          issued_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          client_id?: string | null;
          number?: string | null;
          status?: InvoiceStatus;
          category?: InvoiceCategory;
          issue_date?: string | null;
          due_date?: string | null;
          currency?: string;
          vat_on_debits?: boolean;
          line_total?: number;
          tax_total?: number;
          grand_total?: number;
          seller_snapshot?: Json | null;
          buyer_snapshot?: Json | null;
          pdf_path?: string | null;
          xml_path?: string | null;
          sha256?: string | null;
          issued_at?: string | null;
          paid_at?: string | null;
        };
        Update: Partial<{
          client_id: string | null;
          number: string | null;
          status: InvoiceStatus;
          category: InvoiceCategory;
          issue_date: string | null;
          due_date: string | null;
          currency: string;
          vat_on_debits: boolean;
          line_total: number;
          tax_total: number;
          grand_total: number;
          seller_snapshot: Json | null;
          buyer_snapshot: Json | null;
          pdf_path: string | null;
          xml_path: string | null;
          sha256: string | null;
          issued_at: string | null;
          paid_at: string | null;
        }>;
        Relationships: [];
      };
      invoice_reminders: {
        Row: {
          id: string;
          invoice_id: string;
          stage: number;
          sent_at: string;
        };
        Insert: {
          invoice_id: string;
          stage: number;
          sent_at?: string;
        };
        Update: Partial<{ stage: number; sent_at: string }>;
        Relationships: [];
      };
      invoice_lines: {
        Row: {
          id: string;
          invoice_id: string;
          line_no: number;
          description: string;
          quantity: number;
          unit_code: string;
          unit_price: number;
          vat_rate: number;
          vat_category: string;
          line_total: number;
          created_at: string;
        };
        Insert: {
          invoice_id: string;
          line_no: number;
          description: string;
          quantity?: number;
          unit_code?: string;
          unit_price?: number;
          vat_rate?: number;
          vat_category?: string;
          line_total?: number;
        };
        Update: Partial<{
          line_no: number;
          description: string;
          quantity: number;
          unit_code: string;
          unit_price: number;
          vat_rate: number;
          vat_category: string;
          line_total: number;
        }>;
        Relationships: [];
      };
      invoice_sequences: {
        Row: {
          profile_id: string;
          year: number;
          last_value: number;
        };
        Insert: {
          profile_id: string;
          year: number;
          last_value?: number;
        };
        Update: Partial<{ last_value: number }>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          profile_id: string;
          client_id: string | null;
          number: string | null;
          status: QuoteStatus;
          category: InvoiceCategory;
          issue_date: string | null;
          valid_until: string | null;
          currency: string;
          line_total: number;
          tax_total: number;
          grand_total: number;
          public_token: string;
          accepted_at: string | null;
          accepted_by: string | null;
          pdf_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          client_id?: string | null;
          number?: string | null;
          status?: QuoteStatus;
          category?: InvoiceCategory;
          issue_date?: string | null;
          valid_until?: string | null;
          currency?: string;
          line_total?: number;
          tax_total?: number;
          grand_total?: number;
          accepted_at?: string | null;
          accepted_by?: string | null;
          pdf_path?: string | null;
        };
        Update: Partial<{
          client_id: string | null;
          number: string | null;
          status: QuoteStatus;
          category: InvoiceCategory;
          issue_date: string | null;
          valid_until: string | null;
          currency: string;
          line_total: number;
          tax_total: number;
          grand_total: number;
          accepted_at: string | null;
          accepted_by: string | null;
          pdf_path: string | null;
        }>;
        Relationships: [];
      };
      quote_lines: {
        Row: {
          id: string;
          quote_id: string;
          line_no: number;
          description: string;
          quantity: number;
          unit_code: string;
          unit_price: number;
          vat_rate: number;
          vat_category: string;
          line_total: number;
          created_at: string;
        };
        Insert: {
          quote_id: string;
          line_no: number;
          description: string;
          quantity?: number;
          unit_code?: string;
          unit_price?: number;
          vat_rate?: number;
          vat_category?: string;
          line_total?: number;
        };
        Update: Partial<{
          line_no: number;
          description: string;
          quantity: number;
          unit_code: string;
          unit_price: number;
          vat_rate: number;
          vat_category: string;
          line_total: number;
        }>;
        Relationships: [];
      };
      quote_sequences: {
        Row: { profile_id: string; year: number; last_value: number };
        Insert: { profile_id: string; year: number; last_value?: number };
        Update: Partial<{ last_value: number }>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      next_invoice_number: {
        Args: { p_year: number };
        Returns: number;
      };
      next_quote_number: {
        Args: { p_year: number };
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
