/**
 * Types Supabase générés manuellement pour l'instant.
 *
 * À remplacer par la génération automatique dès qu'un projet Supabase live
 * sera disponible :
 *
 *   supabase gen types typescript --linked > src/lib/supabase/types.ts
 *
 * En attendant, ce fichier reflète à la main le schéma défini dans
 * supabase/migrations/. À mettre à jour à chaque nouvelle migration.
 */

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
