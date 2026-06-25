-- DRACS S6 - Tags emocionales + SSML breaks para mejorar entonación TTS
-- Razón: frases cortas aisladas necesitan contexto emocional explícito
-- para que el modelo TTS las entone como exclamaciones, no como fragmentos de párrafo.

-- Hotspot intros: tono alegre, invitación
update public.ui_audios set text = '[cheerful] ¡Vamos al mar!',         audio_url = null where key = 'hotspot_intro_mar';
update public.ui_audios set text = '[cheerful] ¡A jugar en la casa!',   audio_url = null where key = 'hotspot_intro_casa';
update public.ui_audios set text = '[cheerful] ¡Al castillo de arena!', audio_url = null where key = 'hotspot_intro_playa';
update public.ui_audios set text = '[excited] ¡A buscar sorpresas!',    audio_url = null where key = 'hotspot_intro_faro';
update public.ui_audios set text = '[cheerful] ¡Al sol!',               audio_url = null where key = 'hotspot_intro_sol';

-- Feedback positivo: tono entusiasta
update public.ui_audios set text = '[excited] ¡Muy bien!',   audio_url = null where key = 'feedback_correct_1';
update public.ui_audios set text = '[excited] ¡Genial!',     audio_url = null where key = 'feedback_correct_2';
update public.ui_audios set text = '[excited] ¡Excelente!',  audio_url = null where key = 'feedback_correct_3';

-- Feedback negativo: tono gentil + break SSML para pausa real
update public.ui_audios set text = '[gentle] Casi <break time="400ms"/> [encouraging] ¡prueba de nuevo!', audio_url = null where key = 'feedback_incorrect_1';
update public.ui_audios set text = '[encouraging] ¡Intenta otra vez!', audio_url = null where key = 'feedback_incorrect_2';

select key, text, audio_url from public.ui_audios order by category, key;
