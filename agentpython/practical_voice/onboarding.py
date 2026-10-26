import re
import unicodedata


def normalized(text: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(c) != 'Mn').strip()


def confirmed(text: str) -> bool:
    value = re.sub(r'[^\w\s]', ' ', normalized(text))
    value = re.sub(r'\s+', ' ', value).strip()
    if re.search(r'\bno (soy|confirmo|acepto|estoy listo|estoy lista|es correcto|quiero|he entendido)\b|\b(incorrecto|equivocado)\b', value):
        return False
    return bool(re.search(r'\b(si|confirmo|correcto|exacto|soy|acepto|listo|lista|adelante|empecemos|comencemos|claro|ok|okay|okey|dale|afirmativo)\b|de acuerdo|asi es|por supuesto|no hay problema|puedes continuar', value))


def opening_message(runtime: dict) -> str:
    runtime['conversation_phase'] = 'identity'
    profile = runtime.get('interviewer_profile') or {}
    name = runtime.get('candidate_name') or 'postulante'
    title = runtime.get('job_title') or 'el puesto indicado en tu postulacion'
    return (f"Hola {name}, bienvenido a Achanvear. Soy {profile.get('name', 'tu entrevistador')}, "
            f"y te acompanare en la entrevista practica para {title}. "
            f"El nombre registrado en el sistema es {name}. Antes de empezar, confirmame: "
            "¿eres la persona indicada y estas postulando a este puesto?")


def advance_onboarding(runtime: dict, text: str) -> str | None:
    phase = runtime.get('conversation_phase', 'working')
    title = runtime.get('job_title') or 'este puesto'
    challenge = runtime.get('challenge') or {}
    if phase == 'identity':
        if not confirmed(text):
            return (f"Necesito confirmar tu identidad antes de continuar. En el sistema figuras como "
                    f"{runtime.get('candidate_name') or 'postulante'}. Si no es correcto, revisa tu perfil. ¿Confirmas que eres esa persona?")
        runtime['conversation_phase'] = 'rules'
        requirements = (runtime.get('job_requirements') or runtime.get('job_description') or 'los conocimientos y responsabilidades publicados en la oferta')[:600]
        return (f"Gracias por confirmarlo. Para {title}, revisaremos estos requisitos: {requirements}. "
                "Estas son las reglas: trabaja sin ayuda externa y explica tus decisiones en voz alta. "
                "Puedes interrumpirme para preguntar o aclarar algo. Tres salidas de la pantalla, o permanecer fuera "
                "durante treinta segundos, cancelan la entrevista. El reto tiene una duracion de veinte minutos, "
                "que empezaran despues de presentar el caso y confirmar que estas listo. "
                "¿Entendiste las reglas y estas de acuerdo en continuar?")
    if phase == 'rules':
        if not confirmed(text):
            return ("Puedes interrumpirme y pedir aclaraciones. Tendras veinte minutos para el caso y debes trabajar sin ayuda externa. "
                    "El tiempo aun no ha empezado. ¿Entendiste las reglas y estas listo para conversar sobre tu experiencia?")
        runtime['conversation_phase'] = 'experience'
        return f"Muy bien. Antes del caso, cuentame brevemente tu experiencia relacionada con {title} y una solucion concreta en la que hayas trabajado."
    if phase == 'experience':
        if len(text.split()) < 4:
            return f"Primero cuentame una experiencia concreta relacionada con {title}. Luego te presentare el caso."
        runtime['candidate_experience'] = text
        runtime['conversation_phase'] = 'case_ready'
        prompt = challenge.get('prompt') or challenge.get('description') or 'Resuelve el caso disponible en el espacio de trabajo.'
        return (f"Gracias por compartir tu experiencia. Ahora te presento el caso para {title}: {prompt} "
                f"La herramienta o lenguaje esperado es {challenge.get('language') or runtime.get('workspace_type', 'el indicado en el caso')}. "
                "Puedes revisar el enunciado con el boton Caso y preguntarme si algo no esta claro. ¿Estas listo para empezar el reto?")
    if phase == 'case_ready':
        if not confirmed(text):
            return (f"El objetivo del caso es: {challenge.get('prompt') or challenge.get('description') or challenge.get('title', '')}. "
                    "Puedes hacerme preguntas. Cuando confirmes que estas listo, iniciaremos el tiempo.")
        runtime['conversation_phase'] = 'working'
        return ("Ya revisamos los requisitos y el caso. El cronometro comenzara cuando termine esta indicacion. Tienes 20 minutos. "
                "Puedes usar Ejecutar para comprobar tu trabajo; solamente Entregar finaliza la evaluacion. "
                "Buena suerte. Estoy aqui para ayudarte con aclaraciones, sin resolver el caso por ti. Comienza ahora.")
    return None
