"""Run inside the local agent container; verifies the real audio pipeline with synthetic speech."""
import asyncio
import base64
from practical_voice.audio_pipeline import TextToSpeech, SpeechToText


async def main():
    audio = await TextToSpeech().synthesize_base64("Estoy listo para iniciar la entrevista de programador Python.")
    if not audio:
        raise RuntimeError("No se pudo generar audio; reconocimiento real no verificado")
    text = await SpeechToText().transcribe_webm(base64.b64decode(audio), "Puesto: Programador Python Junior. Lenguaje de programacion: Python.")
    print("TRANSCRIPCION:", text)
    assert "python" in text.lower() and "entrevista" in text.lower(), "El reconocimiento no recupero las palabras esperadas"
    print("PASS: voz sintetica en espanol reconocida por Whisper. El microfono fisico requiere una prueba del usuario.")


asyncio.run(main())
