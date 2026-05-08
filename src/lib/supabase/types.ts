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
 *
 * La structure imite celle de `supabase gen types` (clés Tables, Views,
 * Functions, Enums, CompositeTypes) pour que les types se branchent
 * correctement sur les overloads de @supabase/supabase-js.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
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
        Relationships: [];
      };
    };
    Views: { [_: string]: never };
    Functions: { [_: string]: never };
    Enums: { [_: string]: never };
    CompositeTypes: { [_: string]: never };
  };
};
