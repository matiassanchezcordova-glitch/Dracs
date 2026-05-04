# Configuración de la base de datos Dracs

## 1. Ejecutar el schema SQL

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar el proyecto **Dracs**
3. Abrir **SQL Editor** (panel izquierdo)
4. Copiar el contenido de `src/db/schema.sql`
5. Pegar en el editor y hacer clic en **Run**

## 2. Deshabilitar confirmación de email (recomendado para desarrollo)

Por defecto Supabase requiere que el usuario confirme su email antes de poder iniciar sesión.
Para el flujo de registro de Dracs, desactívalo así:

1. Ir a **Authentication → Providers → Email**
2. Desactivar **Confirm email**
3. Guardar

Con esto el usuario queda autenticado inmediatamente al registrarse.

## 3. Habilitar Google OAuth (opcional)

Si quieres activar "Continuar con Google":

1. Ir a **Authentication → Providers → Google**
2. Activar y añadir Client ID + Client Secret de Google Cloud Console
3. Añadir `https://<tu-dominio>/auth/callback` como redirect URL

## 4. Variables de entorno

Las credenciales de Supabase están en `src/lib/supabase.ts`.
Para producción, moverlas a variables de entorno:

```
VITE_SUPABASE_URL=https://bxhptoigtummmckxnkzv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Extiende auth.users con role y nombre |
| `patients` | Datos del niño (nivel, racha, diagnóstico) |
| `therapists` | Datos profesionales del logopeda |
| `centers` | Centros de trabajo (precargados) |
| `sessions` | Historial de sesiones de ejercicios |
| `therapist_comments` | Notas semanales del terapeuta → familia |
| `link_requests` | Solicitudes de vinculación paciente ↔ terapeuta |
