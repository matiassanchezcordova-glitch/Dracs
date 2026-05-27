# Dracs — Spec de ejercicios MVP

Documento canónico de cómo se diseñan, redactan y validan los ejercicios de Dracs.

Última actualización: Sesión 4 del plan MVP.

---

## Principio rector

**Dracs no son ejercicios. Son juegos.**

El cerebro de un niño con SD (y muchos perfiles neurodivergentes) clasifica las actividades en dos cajones: "tarea" (defensa, capricho, abandono) y "juego" (atención, motivación, persistencia). Toda decisión de diseño empuja al cajón "juego".

Esto se manifiesta en:

- **Lenguaje:** "atrapá", "buscá", "encontrá", "jugamos a". Nunca "completá", "selecciona la respuesta correcta", "ejercicio número 3".
- **Visual:** colores cálidos, ilustraciones expresivas, animaciones suaves de feedback.
- **Audio:** voz cálida, lenta, expresiva. Como una hermana mayor jugando con el niño, no como una maestra.
- **Estructura:** sesiones cortas (5-10 min), micro-victorias frecuentes (cada ejercicio = celebración).
- **Universo narrativo:** todo gira alrededor del mar/playa para crear continuidad emocional.

---

## Perfil del usuario base

- Niño, 8-10 años, síndrome de Down
- Castellano nativo (catalán a v2)
- Vocabulario receptivo más fuerte que expresivo (entiende más de lo que dice)
- Procesamiento auditivo más lento (necesita audio claro y repetible)
- Memoria visual fuerte (las imágenes son la vía principal de información)
- Atención sostenida limitada (~10-15 min en sesión bien diseñada)
- Motivación alta con elementos lúdicos, baja con formato escolar

---

## Universo narrativo

Para mantener al niño enganchado, ~70% de los ejercicios suceden en un mundo costero:

- **Personajes recurrentes:** una niña en la playa, un cangrejo amigo, una gaviota, un pulpo.
- **Lugares:** la playa, el mar, una casita en la costa, un mercado de pescadores, un faro.
- **Objetos recurrentes:** flotador, cubo, pala, gafas de bucear, sombrilla, caracolas, peces.

El ~30% restante rompe el patrón para no aburrir (cocina, animales de granja, escuela, deportes, transportes).

---

## Tipos de ejercicio

### Tipo 1: "Atrapá" (identify_image)

**Mecánica:** suena un audio que nombra un objeto + se muestran 2-5 imágenes. El niño toca la imagen correcta.

**Por qué funciona en SD:** explota la fortaleza visual + el procesamiento auditivo se beneficia porque hay tiempo para mirar las opciones mientras escucha.

**Estructura:**
- Consigna en audio: "Atrapá el {OBJETO}!" o "¿Dónde está el {OBJETO}?"
- 2 a 5 opciones visuales según dificultad
- Tap en imagen → feedback inmediato
- Audio de la palabra dicha al tocarla (refuerzo verbal-visual)

**Categoría:** vocabulary

### Tipo 2: "Cuál NO va" (odd_one_out)

**Mecánica:** se muestran 3-4 imágenes. El niño toca la que NO pertenece al grupo.

**Por qué funciona en SD:** trabaja categorización (función ejecutiva clave). Visualmente directo.

**Estructura:**
- Consigna en audio: "Tres son {CATEGORÍA}. Uno no. ¿Cuál?" (siempre explícita la categoría, no genérico "uno no va")
- 3-4 opciones, una claramente fuera de categoría
- Tap → feedback inmediato

**Categoría:** vocabulary

### Tipo 3: "Ponelo en orden" (sequence)

**Mecánica:** se muestran 3-4 imágenes desordenadas que cuentan una secuencia. El niño las ordena.

**Por qué funciona en SD:** trabaja secuenciación temporal (área comúnmente débil). Refuerza rutinas conocidas.

**Estructura:**
- Consigna en audio: "Ordená los pasos para {ACCIÓN}"
- 3-4 imágenes con orden lógico
- El niño arrastra o toca en secuencia

**Categoría:** sequencing

### Tipo 4: "¿Qué falta?" (fill_blank)

**Mecánica:** se muestra una frase incompleta acompañada de imágenes. El niño toca la palabra/imagen que completa.

**Por qué funciona en SD:** trabaja vocabulario + comprensión sintáctica simple. La imagen ancla el sentido.

**Estructura:**
- Consigna en audio: la frase completa con una pausa donde falta la palabra. "El pescador atrapa un... ¿qué?"
- Se muestra la frase escrita con el hueco
- 2-3 opciones con imagen + palabra
- En niveles altos (4-5), aparece una "imagen ancla" al lado de la frase que da contexto
- Tap → feedback

**Categoría:** vocabulary (en niveles 4-5 también comprehension)

---

## Mecánicas de presentación

Dracs implementa 2 mecánicas según dificultad:

### Mecánica A — Cajitas separadas

Cada opción es una imagen independiente sobre fondo blanco. El niño elige entre 2-3 imágenes claras y separadas visualmente.

**Cuándo se usa:** dificultades 1 y 2 (on-ramp del niño, mecánica simple de elegir).

**Ventaja:** muy clara qué hay que hacer. El niño aprende la mecánica del juego.

**JSON shape:**
```json
{
  "mechanic": "A",
  "word": "PEZ",
  "options": [
    { "image_url": "...", "label": "pez", "is_correct": true },
    { "image_url": "...", "label": "cangrejo", "is_correct": false }
  ]
}
```

### Mecánica B — Escena con zonas tocables

Una sola imagen grande (una escena rica: la playa, el fondo del mar, un acuario) con varios elementos. El niño explora la escena y toca el elemento correcto.

**Cuándo se usa:** dificultades 3, 4 y 5.

**Ventajas:**
- Más inmersivo, más juego, menos test
- El niño "explora" en lugar de "elegir"
- Trabaja también búsqueda visual (función ejecutiva)
- Mantiene el universo narrativo (todo pasa en una playa coherente)

**JSON shape:**
```json
{
  "mechanic": "B",
  "word": "DELFIN",
  "scene_url": "...",
  "scene_description": "Vista del mar con varios mamíferos",
  "hotspots": [
    { "label": "delfín", "x": 320, "y": 480, "radius": 60, "is_correct": true },
    { "label": "ballena", "x": 600, "y": 280, "radius": 50, "is_correct": false }
  ]
}
```

**Nota técnica:** el componente que renderiza Mecánica B se programa en Sesión 8 (no existe en MVP base). Hasta entonces, los ejercicios con `mechanic: "B"` se omiten o se renderizan como fallback con Mecánica A.

---

## Calibración de dificultad

Regla rectora: **los distractores deben estar en la misma categoría conceptual que la respuesta correcta.**

Mal ejemplo: "atrapá el pez", distractor "auto". Resuelve por exclusión sin saber qué es un pez.

Bien ejemplo: "atrapá el pez", distractor "cangrejo". Tiene que SABER qué es un pez para distinguirlo del cangrejo.

### Tipo Atrapá

| Nivel | Opciones | Tipo de distractor |
|-------|----------|---------------------|
| 1 | 2 | Misma categoría amplia (pez vs cangrejo, ambos animales del mar) |
| 2 | 3 | Misma categoría más fina (gaviota vs pato vs paloma, todos pájaros) |
| 3 | 4 | Sub-categoría cercana (delfín vs ballena vs orca vs tiburón) |
| 4 | 4 | Diferencia sutil (pez azul vs pez naranja vs pez globo vs pez verde) |
| 5 | 5 | Acciones, no objetos (nadando vs corriendo vs caminando vs flotando vs sentado) |

### Tipo Cuál NO va

| Nivel | Imágenes | Tipo de "intruso" |
|-------|----------|---------------------|
| 1 | 3 | Diferencia obvia (animales + comida) |
| 2 | 3 | Diferencia clara (3 del mar + 1 terrestre) |
| 3 | 4 | Sub-categorías (3 peces + 1 mamífero) |
| 4 | 4 | Atributos (3 cosas que pesan + 1 que no) |
| 5 | 4 | Función (3 para nadar + 1 para volar) |

### Tipo Ponelo en orden

| Nivel | Pasos | Tipo |
|-------|-------|------|
| 1 | 3 | Rutina diaria muy conocida (zapatos, lavar manos) |
| 2 | 3 | Rutina menos automática (preparar mochila) |
| 3 | 3 | Secuencia narrativa simple (ola crece-rompe-vuelve) |
| 4 | 4 | Secuencia narrativa más larga (día en la playa) |
| 5 | 4 | Secuencia con lógica causal (sembrar-regar-crecer-flor) |

### Tipo ¿Qué falta?

| Nivel | Opciones | Complejidad de frase |
|-------|----------|-----------------------|
| 1 | 2 | Sustantivo simple ("El pez nada en el ___") |
| 2 | 2 | Verbo simple ("El cangrejo ___ en la arena") |
| 3 | 3 | Sustantivo con contexto ("Compré un ___ para ir a la playa") |
| 4 | 3 | Adjetivo descriptivo + imagen ancla ("El mar está muy ___") |
| 5 | 3 | Frase larga con causa ("Llevo el flotador porque no sé ___") |

---

## Reglas de feedback

### Al acertar

- Sonido positivo corto (no estridente)
- Frase de audio variada: "¡Bien!", "¡Lo lograste!", "¡Genial!", "¡Sos un crack!", "¡Eso es!"
- Animación corta (estrella que sale, ola que celebra, etc.)
- Pasaje automático al siguiente ejercicio en 1.5 segundos

### Al fallar

- Sonido neutro (no penalizador)
- Frase de audio: "Casi", "Probá otra vez", "Mirá bien", "Estás cerca"
- Permitir reintento (sin penalización visible)
- Si vuelve a fallar después de 2 intentos: mostrar la respuesta correcta con animación suave + audio "Esta era la {RESPUESTA}. ¡La próxima la atrapamos!" y pasar al siguiente.

### Frases prohibidas

- ❌ "Incorrecto"
- ❌ "Mal"
- ❌ "Eso no es"
- ❌ "Te equivocaste"
- ❌ "Respuesta errónea"

---

## Reglas de duración

- Cada ejercicio: 15-30 segundos máximo
- Sesión completa: 7 ejercicios (5-7 minutos aprox)
- Si el niño quiere seguir, puede iniciar otra sesión

---

## Distribución del MVP

| Tipo | Cantidad | Mecánica A | Mecánica B |
|------|----------|------------|------------|
| Atrapá (identify_image) | 15 | 7 (niveles 1-2) | 8 (niveles 3-5) |
| Cuál NO va (odd_one_out) | 10 | 5 (niveles 1-2) | 5 (niveles 3-5) |
| Ponelo en orden (sequence) | 15 | 8 (niveles 1-2) | 7 (niveles 3-5) |
| ¿Qué falta? (fill_blank) | 15 | 15 (todos, no requiere escena) | 0 |
| **Total** | **55** | **35** | **20** |

---

## Fuentes y referencias

- AELFA (Asociación Española de Logopedia, Foniatría y Audiología)
- Materiales del Ministerio de Educación para Atención Temprana
- Guía Down España: estimulación del lenguaje
- Recursos públicos de centros de atención temprana (CDIAP en Catalunya)
- Literatura sobre juego como vía de aprendizaje en SD: <https://www.downciclopedia.org>

---

## Cambios planeados post-MVP

Anotados en backlog:

- **v2:** versión en catalán
- **v2:** componente para renderizar Mecánica B (Sesión 8)
- **v2:** mecanismo de "imagen ancla" en fill_blank niveles 4-5
- **v2:** más universos narrativos (granja, ciudad, montaña) según preferencias del niño
- **v2:** sistema de progreso adaptativo automático
