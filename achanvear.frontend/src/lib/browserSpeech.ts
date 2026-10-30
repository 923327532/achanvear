export function createSpanishUtterance(text: string): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-PE";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find(voice => voice.lang.toLowerCase().startsWith("es-pe"))
    ?? voices.find(voice => voice.lang.toLowerCase().startsWith("es-"))
    ?? null;
  return utterance;
}
