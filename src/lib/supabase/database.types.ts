/**
 * Types de la base Factura.
 * Écrits à la main pour l'instant ; à terme, régénérer via :
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */
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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
