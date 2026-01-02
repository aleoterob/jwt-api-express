-- Agregar foreign key desde profiles.id hacia auth.users.id
ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_id_fkey" 
FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint
-- Crear función que crea automáticamente un perfil cuando se crea un usuario en auth
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO "public"."profiles" ("id", "email", "full_name")
  VALUES (
    NEW."id",
    NEW."email",
    COALESCE(NEW."raw_user_meta_data"->>'full_name', NEW."email")
  );
  RETURN NEW;
END;
$$;
--> statement-breakpoint
-- Crear trigger que se ejecuta cuando se crea un usuario en auth.users
CREATE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."handle_new_user"();

