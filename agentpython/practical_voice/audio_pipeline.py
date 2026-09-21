import asyncio
import base64
import os
import tempfile
from pathlib import Path
from typing import Optional


class SpeechToText:
    def __init__(self) -> None:
        self.model_name = os.getenv("WHISPER_MODEL", "base")
        self._model = None

    def _load_model(self):
        if self._model is not None:
            return self._model
        try:
            from faster_whisper import WhisperModel
        except Exception as exc:
            raise RuntimeError("faster-whisper is not installed") from exc

        device = os.getenv("WHISPER_DEVICE", "cpu")
        compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
        self._model = WhisperModel(self.model_name, device=device, compute_type=compute_type)
        return self._model

    async def transcribe_webm(self, audio_bytes: bytes) -> str:
        if not audio_bytes:
            return ""
        return await asyncio.to_thread(self._transcribe_sync, audio_bytes)

    def _transcribe_sync(self, audio_bytes: bytes) -> str:
        model = self._load_model()
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        try:
            segments, _ = model.transcribe(
                tmp_path,
                language="es",
                vad_filter=True,
                beam_size=1,
                condition_on_previous_text=False,
            )
            return " ".join(segment.text.strip() for segment in segments).strip()
        finally:
            Path(tmp_path).unlink(missing_ok=True)


class TextToSpeech:
    def __init__(self) -> None:
        self.voice = os.getenv("EDGE_TTS_VOICE", "es-PE-AlexNeural")

    async def synthesize_base64(self, text: str) -> Optional[str]:
        if not text.strip():
            return None
        try:
            import edge_tts
        except Exception:
            return None

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            communicate = edge_tts.Communicate(text, self.voice)
            await communicate.save(tmp_path)
            audio = Path(tmp_path).read_bytes()
            return base64.b64encode(audio).decode("ascii")
        finally:
            Path(tmp_path).unlink(missing_ok=True)
