/**
 * Types de la base Factura.
 * Écrits à la main pour l'instant ; à terme, régénérer via :
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */
export type CompanyLegalForm = "EI" | "micro" | "EURL" | "SASU";
export type CompanyVatRegime = "franchise" | "reel_simplifie" | "reel_normal";
export type ClientKind = "b2b" | "b2c" | "international";

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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
