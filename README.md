# 🔍 Vulnerability Verifier

Herramienta automática de verificación de vulnerabilidades en **WebKit para PS4, PS5 y PC**.  
Detecta tres fallos reales en el motor DOM y en el intérprete LLInt sin intervención del usuario.

---

## ⚡ Vulnerabilidades comprobadas

| ID      | Componente | Descripción |
|---------|------------|-------------|
| DOM‑1   | `postMessage` + ciclos | El *structured clone* **no rechaza objetos con referencias circulares** y las mantiene intactas en el destino. |
| DOM‑2   | Getter durante clonado | Un *getter* enviado dentro de un objeto se ejecuta en pleno proceso de clonación, permitiendo modificar el DOM y ejecutar código. |
| LLInt   | Array inflado (OOB) | Inflar `arr.length = 0xFFFFFFFF` permite **leer y escribir fuera del *butterfly*** real del array. |

---

## 🧠 ¿Qué hace el verificador?

1. **Detecta automáticamente** la plataforma (PS4, PS5 o PC), el firmware, el motor WebKit y el idioma del sistema.
2. **Comprueba todos los componentes necesarios** (Workers, typed arrays, `postMessage`, getters, GC87%).
3. **Ejecuta cada prueba de vulnerabilidad** con controles positivos/negativos y manejo de falsos positivos.
4. **Muestra un resumen final** con los resultados detallados.

Todo ocurre sin botones: solo abre la página y espera el resultado.
