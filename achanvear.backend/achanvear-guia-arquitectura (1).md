# Achanvear — Guia de Arquitectura Tecnica

**Proyecto:** Achanvear — Ecosistema digital de empleo, freelance y desarrollo profesional en Peru
**Autores:** Roberto Carlos Lopez Calle · Arnold Kyle Alva Torres
**Timeline:** 3 meses
**Version:** 2.0 — Abril 2026

---

## 1. Introduccion y Stack Tecnologico

Achanvear es una plataforma todo-en-uno que conecta profesionales, freelancers y empresas en el mercado laboral peruano. El sistema integra busqueda de empleo, proyectos freelance y oferta de servicios profesionales en un solo ecosistema digital.

### 1.1 Stack Completo

#### Backend
| Tecnologia | Version | Uso |
|---|---|---|
| Java | 17 LTS | Lenguaje principal |
| Spring Boot | 4.0.1 | Framework principal |
| Spring Security | 7 | Autenticacion y autorizacion |
| Spring Data JPA | 4.0.1 | Acceso a base de datos |
| PostgreSQL | 18 | Base de datos principal |
| Redis | 7 | Cache de sesiones y datos frecuentes |
| Apache Kafka | 3.7 | Bus de eventos entre bounded contexts |
| JWT (RS256) | — | Tokens de autenticacion |
| MapStruct | 1.6 | Mapeo entre capas (domain <-> JPA entity) |
| Flyway | 10 | Migraciones de base de datos |
| JUnit 5 + Mockito | — | Testing unitario e integración |

#### Frontend
| Tecnologia | Version | Uso |
|---|---|---|
| Next.js | 15 (App Router) | Framework principal |
| TypeScript | 5 | Lenguaje principal |
| TanStack Query | v5 | Fetching, cache y sincronizacion de datos |
| Zustand | 5 | Estado global ligero |
| React Hook Form | 7 | Manejo de formularios |
| Zod | 3 | Validacion de schemas type-safe |
| Axios | 1.7 | Cliente HTTP con interceptores |
| Tailwind CSS | v4 | Estilos utilitarios |
| NextAuth.js | v5 | Autenticacion del lado cliente |
| Lucide Icons | — | Iconos consistentes |

#### Agentes IA
| Tecnologia | Uso |
|---|---|
| Python + FastAPI | Agente de matching de talento (LangChain) |
| LangChain | Orquestacion de cadenas de IA |
| pgvector (PostgreSQL) | Busqueda semantica de perfiles y empleos |
| n8n | Automatizaciones simples (emails, notificaciones) |

#### Almacenamiento y Servicios Externos
| Servicio | Uso |
|---|---|
| **AWS S3** | Almacenamiento de imagenes, videos de portafolio y CVs |
| **Brevo (ex Sendinblue)** | Envio de emails transaccionales (bienvenida, notificaciones) |
| **Cloudflare** | CDN, proxy de dominio, SSL automatico y proteccion DDoS |
| **Mercado Pago** | Pasarela de pagos local Peru (tarjetas, Yape) |

#### Infraestructura por Ambiente

| Ambiente | Base de Datos | Backend | Frontend | Observaciones |
|---|---|---|---|---|
| **Desarrollo local** | PostgreSQL via Docker Compose | Spring Boot local (`localhost:8080`) | Next.js local (`localhost:3000`) | Todo en Docker |
| **Staging (3 meses)** | **Neon** (PostgreSQL serverless) | **Render** (deploy del JAR) | **Vercel** | Costo casi cero, deploy automatico |
| **Produccion (post-lanzamiento)** | **AWS RDS PostgreSQL** | **AWS App Runner o ECS** | **Vercel** | Alta disponibilidad, backups automaticos |

> **Decision de infraestructura para el proyecto de 3 meses:** Neon + Render es la combinacion ideal. Neon ofrece PostgreSQL serverless con tier gratuito generoso y branching de base de datos para pruebas. Render despliega el JAR de Spring Boot con cada push a `main` sin configuracion extra.

---

## 2. Arquitectura del Sistema

### 2.1 Vision General

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENTE                                                            │
│  Next.js 15 (Vercel) — Feature-Based Architecture                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS / REST + WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API GATEWAY                                                        │
│  Spring Cloud Gateway — JWT Filter — Rate Limiter — CORS            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP interno
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODULAR MONOLITH — Spring Boot 4.0.1 + Java 17 + DDD                 │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌─────────┐ │
│  │identity  │ │  jobs    │ │ freelance │ │ profile  │ │payments │ │
│  └──────────┘ └──────────┘ └───────────┘ └──────────┘ └─────────┘ │
└──────┬─────────────┬──────────────────────────────────────────┬────┘
       │             │ Kafka Events                             │ HTTP
       ▼             ▼                                          ▼
┌─────────────┐ ┌───────────────────────────┐   ┌─────────────────────┐
│ PostgreSQL  │ │ AGENTE IA — Python FastAPI │   │ SERVICIOS EXTERNOS  │
│ + pgvector  │ │ Matching · Validator       │   │ AWS S3 · Brevo      │
│ Redis Cache │ └───────────────────────────┘   │ Mercado Pago · n8n         │
└─────────────┘                                 └─────────────────────┘
```

### 2.2 Por que Modular Monolith y NO Microservicios


### 2.3 Aclaracion Importante — Como se integra Python con Java

Si, la idea correcta es esta:

- **Toda la logica del agente de IA vive en Python** (FastAPI + LangChain + TTS + evaluadores).
- **Tu sistema principal sigue siendo Java Spring Boot**.
- **Spring Boot NO implementa la IA**, solo la orquesta.
- **Java llama al agente Python por HTTP interno o mensajeria asincrona**.
- **El frontend JAMAS habla directo con Python**. Siempre habla con tu backend Java.

El flujo correcto es este:

```
Frontend Next.js
      │
      ▼
Backend Spring Boot (sistema principal)
      │
      ├── llama a PostgreSQL / Redis / S3 / Mercado Pago / Brevo
      │
      └── llama al Agente Python (FastAPI)
              │
              ├── screening de candidatos
              ├── entrevista teorica
              ├── entrevista tecnica
              ├── seleccion del perfil de voz
              └── generacion del reporte final
```

En otras palabras: **Python es un servicio especializado de IA**, pero **Java sigue siendo el core del negocio**.

#### Que hace Java y que hace Python

| Componente | Responsabilidad |
|---|---|
| **Next.js** | UI, formularios, dashboard, sala de entrevista, grabacion de pantalla |
| **Spring Boot** | Usuarios, empleos, postulaciones, reglas de negocio, seguridad, pagos, persistencia, orquestacion del flujo |
| **Python FastAPI** | Matching, entrevistas, scoring, prompts, voces, evaluacion automatica, recomendacion final |
| **PostgreSQL** | Datos principales del sistema |
| **AWS S3** | Videos, CVs, imagenes, grabaciones |

#### Regla tecnica importante

Spring Boot debe tratar al agente Python como un **adapter externo**, igual que S3 o Mercado Pago. Eso significa:

- La llamada a Python vive en `infrastructure/external/`
- La interfaz puede vivir en `application/port/out/` o directamente como client adapter si quieres mantenerlo simple
- El dominio nunca conoce FastAPI, HTTP, JSON ni LangChain

Ejemplo conceptual:

```java
// application/
public interface CandidateScreeningPort {
    ScreeningResult evaluate(ScreeningRequest request);
}

// infrastructure/external/
@Component
public class PythonScreeningClient implements CandidateScreeningPort {
    @Override
    public ScreeningResult evaluate(ScreeningRequest request) {
        // HTTP call a FastAPI
    }
}
```

Entonces, si: **Python hace la IA y Java la invoca**.

---

Para un equipo de 2-3 personas en 3 meses, los microservicios son over-engineering. Esta es la comparacion honesta:

| Criterio | Modular Monolith ✅ | Microservicios ❌ |
|---|---|---|
| Setup inicial | 1 dia | 1-2 semanas |
| Despliegue | 1 JAR, 1 Docker image | Kubernetes + registry + service mesh |
| Debugging | Stack trace unificado | Distributed tracing (Jaeger, Zipkin) |
| Transacciones | `@Transactional` funciona directo | Patron Saga obligatorio |
| Equipo pequeno (2-3 devs) | **Ideal** | Over-engineering severo |
| Escalabilidad futura | Se extrae el modulo cuando sea necesario | Complejidad desde el dia 1 |

La arquitectura DDD interna es **identica** en ambos enfoques. Si el dia de manana necesitan separar el modulo de `payments` como microservicio independiente, el codigo ya esta desacoplado y listo.

---

## 3. Backend — DDD con Modular Monolith

### 3.1 La Regla Fundamental de Capas

La dependencia SIEMPRE va hacia adentro. Nunca al reves:

```
infrastructure/  →  application/  →  domain/
   (Spring,           (Use Cases,      (Java puro,
    JPA, REST)         Comandos)        sin Spring)
```

**`domain/`** — Java puro, cero anotaciones de Spring. Si ves `@Service` o `@Repository` aqui, algo esta mal.

**`application/`** — Orquesta el dominio. `@Transactional` va aqui, nunca en `domain/`.

**`infrastructure/`** — Adapters: JPA, Kafka, controladores REST, clientes HTTP.

### 3.2 Estructura de Carpetas del Backend

```
achanvear-backend/
└── src/
    └── main/
        ├── java/com/achanvear/
        │
        ├── AchanvearApplication.java              # Punto de entrada Spring Boot
        │
        ├── shared/                                # Código compartido entre todos los módulos
        │   ├── domain/
        │   │   ├── AggregateRoot.java             # Clase base de aggregates (maneja Domain Events)
        │   │   ├── DomainEvent.java               # Interfaz base para eventos de dominio
        │   │   └── ValueObject.java               # Marker interface para Value Objects
        │   ├── infrastructure/
        │   │   ├── EventPublisher.java            # Publica eventos (Kafka, Spring Events, etc.)
        │   │   └── BaseJpaEntity.java             # Auditoría: createdAt, updatedAt
        │   ├── web/
        │   │   ├── ApiResponse.java               # Wrapper estándar API {data, message, success}
        │   │   └── GlobalExceptionHandler.java    # Manejo global de errores HTTP
        │   └── config/
        │       ├── JpaConfig.java                 # Configuración JPA (auditing, base config)
        │       ├── SecurityBeans.java             # Beans globales de seguridad (password encoder, etc.)
        │       └── OpenApiConfig.java             # Configuración Swagger / OpenAPI
        │
        ├── identity/                             # BOUNDED CONTEXT: autenticación y usuarios
        │   ├── domain/
        │   │   ├── model/
        │   │   │   ├── User.java                 # Aggregate Root usuario
        │   │   │   ├── UserId.java               # Value Object (UUID tipado)
        │   │   │   ├── Email.java                # Value Object con validación
        │   │   │   ├── UserRole.java             # Enum: roles del sistema
        │   │   │   └── UserStatus.java           # Enum: estado del usuario
        │   │   ├── repository/
        │   │   │   └── UserRepository.java       # Contrato de persistencia del dominio
        │   │   ├── event/
        │   │   │   └── UserRegisteredEvent.java  # Evento al registrar usuario
        │   │   └── factory/
        │   │       └── UserFactory.java          # Construcción controlada del aggregate
        │   ├── application/
        │   │   ├── RegisterUserUseCase.java      # Caso de uso registro
        │   │   ├── LoginUserUseCase.java         # Caso de uso login
        │   │   ├── command/
        │   │   │   └── RegisterUserCommand.java  # Input inmutable
        │   │   ├── dto/
        │   │   │   └── UserResponse.java         # Output hacia cliente
        │   │   └── impl/
        │   │       └── AuthApplicationService.java # Implementa casos de uso
        │   └── infrastructure/
        │       ├── persistence/
        │       │   ├── UserJpaEntity.java        # Entidad JPA
        │       │   ├── UserJpaRepository.java    # Spring Data JPA repo
        │       │   ├── UserRepositoryImpl.java   # Adaptador dominio → JPA
        │       │   └── UserMapper.java           # Mapper domain <-> entity
        │       ├── security/
        │       │   ├── JwtTokenProvider.java     # Generación y validación JWT
        │       │   ├── SecurityConfig.java       # Configuración Spring Security
        │       │   └── JwtAuthFilter.java        # Filtro autenticación JWT
        │       └── web/
        │           └── AuthController.java       # REST endpoints auth
        │
        ├── jobs/                                 # BOUNDED CONTEXT: empleos
        │   ├── domain/
        │   │   ├── model/
        │   │   │   ├── JobPost.java              # Aggregate Root oferta laboral
        │   │   │   ├── JobPostId.java
        │   │   │   ├── JobType.java              # Enum tipo empleo
        │   │   │   ├── JobApplication.java       # Entity dentro del aggregate
        │   │   │   └── ApplicationStatus.java
        │   │   ├── repository/
        │   │   │   ├── JobPostRepository.java
        │   │   │   └── ApplicationRepository.java
        │   │   ├── event/
        │   │   │   ├── JobPublishedEvent.java
        │   │   │   └── ApplicationSubmittedEvent.java
        │   │   └── factory/
        │   │       └── JobPostFactory.java
        │   ├── application/
        │   │   ├── CreateJobUseCase.java
        │   │   ├── ApplyToJobUseCase.java
        │   │   ├── SearchJobsUseCase.java
        │   │   ├── command/
        │   │   │   ├── CreateJobCommand.java
        │   │   │   └── ApplyJobCommand.java
        │   │   ├── query/
        │   │   │   └── JobSearchQuery.java       # CQRS lectura
        │   │   ├── dto/
        │   │   │   ├── JobPostResponse.java
        │   │   │   └── ApplicationResponse.java
        │   │   └── impl/
        │   │       └── JobApplicationService.java
        │   └── infrastructure/
        │       ├── persistence/
        │       │   ├── JobPostJpaEntity.java
        │       │   ├── JobPostJpaRepository.java
        │       │   ├── JobPostRepositoryImpl.java
        │       │   ├── JobPostMapper.java
        │       │   └── ApplicationMapper.java    # Mapper aplicaciones
        │       ├── event/
        │       │   └── DomainEventHandler.java   # Reacciona a eventos (IA, n8n)
        │       └── web/
        │           └── JobController.java
        │
        ├── freelance/                            # BOUNDED CONTEXT: proyectos freelance
        │   ├── domain/
        │   │   ├── model/
        │   │   │   ├── FreelanceProject.java
        │   │   │   ├── Proposal.java
        │   │   │   ├── Milestone.java
        │   │   │   └── ProjectStatus.java
        │   │   ├── repository/
        │   │   │   ├── FreelanceProjectRepository.java
        │   │   │   └── ProposalRepository.java
        │   │   ├── event/
        │   │   │   └── ProposalSubmittedEvent.java
        │   │   └── factory/
        │   ├── application/
        │   └── infrastructure/
        │
        ├── profile/                              # BOUNDED CONTEXT: perfil profesional
        │   ├── domain/
        │   │   ├── model/
        │   │   │   ├── TalentProfile.java
        │   │   │   ├── Skill.java
        │   │   │   ├── SkillLevel.java
        │   │   │   └── ReputationScore.java
        │   │   ├── repository/
        │   │   │   └── TalentProfileRepository.java
        │   │   └── event/
        │   │       └── ProfileCompletedEvent.java # Dispara IA validación
        │   ├── application/
        │   └── infrastructure/
        │       └── external/
        │           └── AiValidatorClient.java     # Llama agente Python
        │
        ├── payments/                             # BOUNDED CONTEXT: pagos
        │   ├── domain/
        │   │   ├── model/
        │   │   │   ├── Payment.java
        │   │   │   ├── CommissionPolicy.java
        │   │   │   ├── PaymentStatus.java
        │   │   │   └── Wallet.java
        │   │   ├── repository/
        │   │   │   ├── PaymentRepository.java
        │   │   │   └── WalletRepository.java
        │   │   ├── service/
        │   │   │   └── CommissionCalculator.java # Lógica pura de comisión
        │   │   └── event/
        │   │       └── PaymentCompletedEvent.java
        │   ├── application/
        │   └── infrastructure/
        │       └── external/
        │           └── MercadoPagoGateway.java    # Integración pagos
        │
        ├── notifications/                        # BOUNDED CONTEXT: notificaciones
        │   ├── domain/
        │   ├── application/
        │   └── infrastructure/
        │       └── external/
        │           ├── N8nWebhookClient.java     # Automatizaciones n8n
        │           └── BrevoEmailClient.java     # Emails transaccionales
        │
        ├── hiring/                              # BOUNDED CONTEXT: pipeline selección
        │   ├── domain/
        │   │   ├── model/
        │   │   │   ├── HiringProcess.java
        │   │   │   ├── HiringProcessId.java
        │   │   │   ├── CandidateScreening.java
        │   │   │   ├── HiringStage.java
        │   │   │   ├── ScreeningResult.java
        │   │   │   └── HiringConfig.java
        │   │   ├── repository/
        │   │   │   └── HiringProcessRepository.java
        │   │   ├── event/
        │   │   │   ├── ScreeningCompletedEvent.java
        │   │   │   ├── TheoryInterviewPassedEvent.java
        │   │   │   └── TechnicalInterviewDoneEvent.java
        │   │   └── factory/
        │   │       └── HiringProcessFactory.java
        │   ├── application/
        │   │   ├── StartScreeningUseCase.java
        │   │   ├── EvaluateTheoryResultUseCase.java
        │   │   ├── GenerateFinalReportUseCase.java
        │   │   ├── command/
        │   │   │   ├── StartScreeningCommand.java
        │   │   │   └── EvaluateTheoryResultCommand.java
        │   │   ├── dto/
        │   │   │   ├── ScreeningResultResponse.java
        │   │   │   └── HiringReportResponse.java
        │   │   └── impl/
        │   │       └── HiringApplicationService.java
        │   └── infrastructure/
        │       ├── persistence/
        │       ├── external/
        │       │   └── AiScreeningClient.java    # IA screening candidatos
        │       └── web/
        │           └── HiringController.java
        │
        └── interview/                           # BOUNDED CONTEXT: entrevistas IA
            ├── domain/
            │   ├── model/
            │   │   ├── Interview.java
            │   │   ├── InterviewId.java
            │   │   ├── InterviewType.java
            │   │   ├── InterviewStatus.java
            │   │   ├── InterviewerProfile.java
            │   │   ├── InterviewerVoice.java
            │   │   ├── InterviewScore.java
            │   │   ├── Question.java
            │   │   ├── Answer.java
            │   │   └── RecordingSession.java
            │   ├── repository/
            │   │   └── InterviewRepository.java
            │   ├── service/
            │   │   ├── InterviewerProfileSelector.java # Selecciona tipo de entrevistador IA
            │   │   └── ScoreCalculator.java            # Calcula score final
            │   ├── event/
            │   │   ├── InterviewStartedEvent.java
            │   │   ├── InterviewCompletedEvent.java
            │   │   └── ScreenViolationDetectedEvent.java # Detecta fraude
            │   └── factory/
            │       └── InterviewFactory.java
            ├── application/
            │   ├── ScheduleInterviewUseCase.java
            │   ├── StartInterviewSessionUseCase.java
            │   ├── SubmitAnswerUseCase.java
            │   ├── CompleteInterviewUseCase.java
            │   ├── command/
            │   │   ├── ScheduleInterviewCommand.java
            │   │   ├── StartInterviewSessionCommand.java
            │   │   └── SubmitAnswerCommand.java
            │   ├── dto/
            │   │   ├── InterviewSessionResponse.java
            │   │   ├── QuestionResponse.java
            │   │   └── InterviewReportResponse.java
            │   └── impl/
            │       └── InterviewApplicationService.java
            └── infrastructure/
                ├── persistence/
                ├── concurrency/
                │   └── InterviewSlotManager.java      # Limita concurrencia entrevistas
                ├── external/
                │   ├── AiInterviewerClient.java       # IA entrevistas
                │   ├── TextToSpeechClient.java        # Voz (ElevenLabs/AWS)
                │   └── S3RecordingClient.java         # Guarda grabaciones
                ├── websocket/
                │   └── InterviewWebSocketHandler.java # Comunicación tiempo real
                └── web/
                    └── InterviewController.java
        │
        └── resources/
            ├── application.yml                      # Config principal
            └── application-dev.yml                  # Config entorno dev
```

### 3.3 Codigo Clave del Backend

#### Domain — El corazon (Java puro, sin Spring)

```java
// User.java — Aggregate Root PURO
public class User {

    private final UserId id;
    private Email email;           // Value Object, no String crudo
    private String passwordHash;
    private UserRole role;
    private UserStatus status;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    // Factory method estatico — se crea desde UserFactory, no con 'new' directo
    public static User create(UserId id, Email email, String passwordHash, UserRole role) {
        User user = new User(id, email, passwordHash, role, UserStatus.PENDING);
        user.domainEvents.add(new UserRegisteredEvent(id, email));
        return user;
    }

    // La logica de negocio vive AQUI, no en el service
    public void activate() {
        if (this.status != UserStatus.PENDING) {
            throw new IllegalStateException("User is not in PENDING status");
        }
        this.status = UserStatus.ACTIVE;
    }

    // Los eventos se extraen luego del save(), no antes
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return events;
    }
}

// Email.java — Value Object con validacion encapsulada
public record Email(String value) {
    public Email {
        Objects.requireNonNull(value);
        if (!value.matches("^[\\w-.]+@[\\w-]+\\.[a-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email format: " + value);
        }
    }
}

// UserRepository.java — Interfaz en domain/, implementacion en infrastructure/
public interface UserRepository {
    void save(User user);
    Optional<User> findById(UserId id);
    Optional<User> findByEmail(Email email);
    boolean existsByEmail(Email email);
}
```

#### Application — Orquesta sin decidir

```java
// RegisterUserCommand.java — Record inmutable (Java 16+)
public record RegisterUserCommand(
    String email,
    String rawPassword,
    String role
) {}

// AuthApplicationService.java — Implementa los use cases
@Service
@Transactional
public class AuthApplicationService implements RegisterUserUseCase, LoginUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventPublisher eventPublisher;
    private final UserFactory userFactory;

    // Constructor injection SIEMPRE — nunca @Autowired en campos
    public AuthApplicationService(UserRepository userRepository,
                                   PasswordEncoder passwordEncoder,
                                   EventPublisher eventPublisher,
                                   UserFactory userFactory) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
        this.userFactory = userFactory;
    }

    @Override
    public UserResponse execute(RegisterUserCommand command) {
        Email email = new Email(command.email());

        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(email);
        }

        String hash = passwordEncoder.encode(command.rawPassword());
        User user = userFactory.create(email, hash, UserRole.valueOf(command.role()));

        userRepository.save(user);

        // Publicar eventos DESPUES del save(), nunca antes
        user.pullDomainEvents().forEach(eventPublisher::publish);

        return UserResponse.from(user);
    }
}
```

#### Infrastructure — Adapters con Spring

```java
// UserRepositoryImpl.java — Implementa la interfaz del domain
@Repository
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository jpaRepository;
    private final UserMapper mapper;

    public UserRepositoryImpl(UserJpaRepository jpaRepository, UserMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(User user) {
        jpaRepository.save(mapper.toEntity(user));
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.value()).map(mapper::toDomain);
    }
}

// AuthController.java — Solo mapea HTTP, CERO logica de negocio
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;

    public AuthController(RegisterUserUseCase registerUserUseCase) {
        this.registerUserUseCase = registerUserUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterUserCommand command = new RegisterUserCommand(
                request.email(), request.password(), request.role());

        UserResponse response = registerUserUseCase.execute(command);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }
}
```

#### Domain Events — Comunicacion entre bounded contexts

```java
// JobPublishedEvent.java
public record JobPublishedEvent(
    JobPostId jobPostId,
    String title,
    Instant occurredAt
) implements DomainEvent {}

// DomainEventHandler.java — En infrastructure/event del modulo notifications
@Component
public class DomainEventHandler {

    private final N8nWebhookClient n8nClient;
    private final BrevoEmailClient brevoClient;

    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        // Brevo envia el email de bienvenida
        brevoClient.sendWelcomeEmail(event.email().value());
    }

    @EventListener
    public void handleJobPublished(JobPublishedEvent event) {
        // n8n dispara notificaciones a candidatos relevantes
        n8nClient.triggerJobNotification(event.jobPostId().value(), event.title());
    }
}
```

#### Despliegue Liviano con Docker

```dockerfile
# Dockerfile — Multi-stage build, imagen final ~150MB
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/target/achanvear-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xms256m", "-Xmx512m", "app.jar"]
```

```yaml
# docker-compose.yml — Ambiente local completo con un solo comando
services:
  app:
    build: .
    ports: ["8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/achanvear
      AWS_S3_BUCKET: achanvear-media-dev
      BREVO_API_KEY: ${BREVO_API_KEY}
      MERCADOPAGO_ACCESS_TOKEN: ${MERCADOPAGO_ACCESS_TOKEN}
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: achanvear
      POSTGRES_USER: achanvear
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "achanvear"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
```

---

## 4. Frontend — Next.js 15 con Feature-Based Architecture

### 4.1 Por que Feature-Based y no Atomic Design

Atomic Design organiza por **tipo de componente** (atoms, molecules, organisms). Feature-Based organiza por **funcionalidad de negocio**. Para Achanvear, la segunda opcion es superior:

| Criterio | Feature-Based ✅ | Atomic Design ❌ |
|---|---|---|
| Encontrar codigo de "jobs" | `features/jobs/` — todo en un lugar | Disperso en atoms, molecules, organisms, pages |
| Agregar una nueva funcionalidad | Nueva carpeta en `features/` | Modificar 4-5 carpetas distintas |
| Onboarding de un dev nuevo | Intuitivo: carpeta = funcionalidad | Requiere entender la jerarquia atomica |
| Escalar el equipo | Cada dev owna una feature | Conflictos en carpetas compartidas |

### 4.2 Estructura Completa del Frontend

```
achanvear-frontend/
└── src/
│
├── app/                                         # Routing Next.js (App Router) — SIN lógica de negocio
│   ├── (public)/
│   │   ├── page.tsx                             # Landing page /
│   │   └── layout.tsx                           # Layout público (header simple, footer)
│   │
│   ├── (auth)/                                  # Rutas sin layout de dashboard
│   │   ├── login/
│   │   │   └── page.tsx                         # Página login
│   │   └── register/
│   │       └── page.tsx                         # Página registro
│   │
│   ├── (dashboard)/                             # Rutas protegidas
│   │   ├── layout.tsx                           # Shell: Sidebar + Topbar + AuthGuard
│   │   ├── page.tsx                             # /dashboard home
│   │   │
│   │   ├── jobs/
│   │   │   ├── page.tsx                         # Listado empleos
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                     # Detalle empleo
│   │   │   └── create/
│   │   │       └── page.tsx                     # Crear empleo (COMPANY)
│   │   │
│   │   ├── freelance/
│   │   │   ├── page.tsx                         # Listado proyectos
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx                         # Mi perfil
│   │   │   └── [username]/
│   │   │       └── page.tsx                     # Perfil público
│   │   │
│   │   └── payments/
│   │       └── page.tsx                         # Wallet y transacciones
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts                     # Handler NextAuth
│   │
│   ├── layout.tsx                              # Root layout (providers globales)
│   └── globals.css                             # Estilos globales
│
├── features/                                   # CORE — lógica real del negocio
│
│   ├── auth/                                   # Feature autenticación
│   │   ├── components/
│   │   │   ├── LoginForm.tsx                   # Form login
│   │   │   ├── RegisterForm.tsx                # Form registro
│   │   │   └── RoleSelector.tsx                # Selector rol usuario
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                      # Manejo sesión (login/logout)
│   │   │   └── useRegister.ts                  # Registro usuario
│   │   ├── api/
│   │   │   └── authApi.ts                      # Calls backend identity
│   │   ├── schemas/
│   │   │   └── auth.schema.ts                  # Validaciones Zod
│   │   └── types/
│   │       └── auth.types.ts                   # Tipos TS auth
│
│   ├── jobs/                                   # Feature empleos + hiring + entrevistas IA
│   │   ├── components/
│   │   │   ├── JobCard.tsx                     # Card empleo
│   │   │   ├── JobList.tsx                     # Lista con paginación
│   │   │   ├── JobFilters.tsx                  # Filtros
│   │   │   ├── JobForm.tsx                     # Crear/editar job
│   │   │   ├── ApplicationModal.tsx            # Modal postulación
│   │   │
│   │   │   ├── HiringPipeline.tsx              # Vista empresa pipeline selección
│   │   │   ├── CandidateCard.tsx               # Card candidato
│   │   │   ├── ScreeningResults.tsx            # Resultados IA screening
│   │   │   ├── HiringReport.tsx                # Reporte final empresa
│   │   │
│   │   │   ├── InterviewRoom.tsx               # Sala entrevista IA
│   │   │   ├── InterviewerAvatar.tsx           # Avatar IA
│   │   │   ├── QuestionDisplay.tsx             # Pregunta actual
│   │   │   ├── AnswerRecorder.tsx              # Respuesta (voz/texto)
│   │   │   ├── CodeEditor.tsx                  # Editor técnico
│   │   │   ├── LegalCasePanel.tsx              # Caso práctico legal
│   │   │   ├── TimerBar.tsx                    # Tiempo por pregunta
│   │   │   ├── AntiCheatBanner.tsx             # Aviso anti-trampa
│   │   │   └── ScreenRecordingConsent.tsx      # Consentimiento grabación
│   │
│   │   ├── hooks/
│   │   │   ├── useJobList.ts                   # Query lista jobs
│   │   │   ├── useJobDetail.ts                 # Query detalle job
│   │   │   ├── useApplyJob.ts                  # Mutation aplicar
│   │   │   ├── useHiringProcess.ts             # Estado pipeline candidato
│   │   │   ├── useCandidateList.ts             # Lista candidatos empresa
│   │   │   ├── useInterviewSession.ts          # WebSocket IA
│   │   │   ├── useScreenRecording.ts           # Grabación pantalla
│   │   │   └── useAntiCheat.ts                 # Detección fraude
│   │
│   │   ├── api/
│   │   │   └── jobApi.ts                       # Jobs + hiring + interviews
│   │
│   │   ├── store/
│   │   │   └── useJobFiltersStore.ts           # Zustand filtros
│   │
│   │   ├── schemas/
│   │   │   └── job.schema.ts                  # Validaciones
│   │
│   │   └── types/
│   │       └── job.types.ts                   # Tipos dominio jobs + entrevistas
│
│   ├── freelance/                             # Feature freelance
│   │   ├── components/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProposalForm.tsx
│   │   │   └── MilestoneTracker.tsx
│   │   ├── hooks/
│   │   │   ├── useFreelanceProjects.ts
│   │   │   └── useSubmitProposal.ts
│   │   ├── api/
│   │   │   └── freelanceApi.ts
│   │   └── types/
│   │       └── freelance.types.ts
│
│   ├── profile/                               # Feature perfil
│   │   ├── components/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   ├── PortfolioSection.tsx
│   │   │   ├── ReputationBadge.tsx
│   │   │   └── CandidateProgressCard.tsx      # Progreso candidato
│   │   ├── hooks/
│   │   │   ├── useProfile.ts
│   │   │   ├── useUpdateProfile.ts
│   │   │   └── useCandidateProgress.ts
│   │   ├── api/
│   │   │   └── profileApi.ts
│   │   └── types/
│   │       └── profile.types.ts
│
│   ├── payments/                              # Feature pagos
│   │   ├── components/
│   │   │   ├── WalletBalance.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── CommissionBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useWallet.ts
│   │   │   └── useTransactions.ts
│   │   ├── api/
│   │   │   └── paymentApi.ts
│   │   └── types/
│   │       └── payment.types.ts
│
│   └── notifications/                         # Feature notificaciones
│       ├── components/
│       │   ├── NotificationBell.tsx
│       │   ├── NotificationItem.tsx
│       │   └── InterviewInvitationCard.tsx    # Invitación entrevista
│       ├── hooks/
│       │   └── useNotifications.ts
│       └── types/
│           └── notification.types.ts
│
├── shared/                                    # Utilidades puras (sin negocio)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx                    # Avatar con fallback S3
│   │   │   ├── Skeleton.tsx                  # Loading UI
│   │   │   └── EmptyState.tsx                # Estado vacío
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Topbar.tsx
│   │       ├── PageWrapper.tsx
│   │       └── AuthGuard.tsx                 # Protección rutas
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts                   # Optimiza inputs
│   │   ├── usePagination.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── lib/
│   │   ├── axiosClient.ts                   # Cliente HTTP + JWT interceptor
│   │   ├── queryClient.ts                   # Config TanStack Query
│   │   ├── s3Helpers.ts                     # Upload a S3
│   │   └── formatters.ts                    # Formatos (fecha, moneda)
│   │
│   └── types/
│       ├── api.types.ts                     # Tipos API globales
│       └── global.d.ts
│
└── store/                                   # Estado global Zustand
    ├── useAuthStore.ts                      # Usuario, token, rol
    └── useUiStore.ts                        # UI global (sidebar, theme)
```

### 4.3 Patrones de Diseno Clave del Frontend

#### Patron 1: Custom Hook como capa de datos

El componente NUNCA hace fetch directamente. Siempre delega a un custom hook:

```typescript
// features/jobs/hooks/useJobList.ts
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import { useJobFiltersStore } from "../store/useJobFiltersStore";
import type { JobPost, PaginatedResponse } from "@/shared/types/api.types";

export function useJobList() {
  const filters = useJobFiltersStore((state) => state.filters);

  const query = useQuery<PaginatedResponse<JobPost>>({
    queryKey: ["jobs", filters],          // El cache se invalida cuando cambian los filtros
    queryFn: () => jobApi.getAll(filters),
    staleTime: 1000 * 60 * 2,            // Datos frescos por 2 minutos
  });

  return {
    jobs: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
```

#### Patron 2: Presentational vs Container Component

```typescript
// JobCard.tsx — PRESENTACIONAL: solo renderiza, recibe todo via props
// No sabe nada de la API ni del estado global
interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: "FULL_TIME" | "PART_TIME" | "FREELANCE";
  onApply: () => void;
}

export function JobCard({ title, company, location, salary, type, onApply }: JobCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm">{company} · {location}</p>
      {salary && <span className="text-sm font-medium">{salary}</span>}
      <Badge variant={type === "FREELANCE" ? "teal" : "blue"}>{type}</Badge>
      <Button onClick={onApply} className="mt-4 w-full">Postular</Button>
    </article>
  );
}

// JobList.tsx — CONTAINER: conecta datos con presentacion
export function JobList() {
  const { jobs, isLoading, isError } = useJobList();     // Delega al hook
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  if (isLoading) return <Skeleton rows={5} />;
  if (isError) return <EmptyState message="No se pudieron cargar los empleos" action="Reintentar" />;
  if (jobs.length === 0) return <EmptyState message="No hay empleos disponibles" action="Limpiar filtros" />;

  return (
    <>
      <ul className="grid gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            title={job.title}
            company={job.company}
            location={job.location}
            type={job.type}
            onApply={() => setSelectedJobId(job.id)}
          />
        ))}
      </ul>
      {selectedJobId && (
        <ApplicationModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </>
  );
}
```

#### Patron 3: Axios Client centralizado con interceptores

```typescript
// shared/lib/axiosClient.ts
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Adjunta el JWT en cada request automaticamente
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Maneja el 401 globalmente: redirige a login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

#### Patron 4: Zod Schema + React Hook Form

```typescript
// features/jobs/schemas/job.schema.ts
import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(5, "El titulo debe tener al menos 5 caracteres").max(100),
  description: z.string().min(50, "La descripcion debe tener al menos 50 caracteres"),
  type: z.enum(["FULL_TIME", "PART_TIME", "FREELANCE"]),
  location: z.string().min(3, "Ingresa una ubicacion valida"),
  salary: z.string().optional(),
  skills: z.array(z.string()).min(1, "Selecciona al menos una habilidad"),
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;

// features/jobs/components/JobForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, type CreateJobFormData } from "../schemas/job.schema";

export function JobForm({ onSubmit }: { onSubmit: (data: CreateJobFormData) => void }) {
  const form = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { type: "FULL_TIME", skills: [] },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Titulo del empleo"
        {...form.register("title")}
        error={form.formState.errors.title?.message}
      />
      <Select
        label="Tipo de empleo"
        {...form.register("type")}
        options={["FULL_TIME", "PART_TIME", "FREELANCE"]}
      />
      <Button type="submit" loading={form.formState.isSubmitting}>
        Publicar empleo
      </Button>
    </form>
  );
}
```

#### Patron 5: Subida de archivos a S3 con URLs presignadas

```typescript
// shared/lib/s3Helpers.ts
// El backend genera la URL presignada, el frontend sube directamente a S3
// Esto evita que los archivos pasen por el servidor de Spring Boot

export async function uploadToS3(file: File, folder: "avatars" | "portfolios" | "cvs") {
  // 1. Pedir la URL presignada al backend
  const { data } = await axiosClient.post<{ uploadUrl: string; fileKey: string }>(
    "/api/v1/storage/presigned-url",
    { fileName: file.name, contentType: file.type, folder }
  );

  // 2. Subir directamente a S3 (no pasa por Spring Boot)
  await fetch(data.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return data.fileKey; // Se guarda en el perfil del usuario
}
```

### 4.4 Reglas de Oro del Frontend

| Regla | NO hacer | SI hacer |
|---|---|---|
| Fetch en componentes | `useEffect(() => fetch(...))` directo | Siempre via custom hook con TanStack Query |
| Imports entre features | `features/jobs` importa de `features/profile` | Comunicar via store global o API |
| Validacion manual | `if (!email.includes('@'))` en el componente | Zod schema + React Hook Form siempre |
| Tipos `any` | `const data: any = response.data` | Tipar con interfaces o `z.infer<typeof schema>` |
| Estado de carga | No mostrar nada mientras carga | Skeleton loaders en todos los listados |
| Estado vacio | Renderizar lista vacia sin mensaje | `<EmptyState>` con mensaje claro y CTA |

---


---

## 7. Sistema de Seleccion Inteligente con IA (Hiring Pipeline)

Esta es una de las funcionalidades mas diferenciadoras de Achanvear. El proceso de seleccion esta completamente automatizado por agentes de IA, desde el filtrado inicial hasta la entrevista tecnica con voz sintetica humana.

### 7.1 Vision General del Pipeline

```
EMPRESA publica puesto
        │
        ▼
[POSTULACIONES ABIERTAS]
30 candidatos postulan
        │
        ▼
┌───────────────────────────────┐
│  AGENTE IA — SCREENING        │
│  Evalua perfil, skills,       │
│  experiencia vs requisitos    │
│  Selecciona top 16            │
└──────────────┬────────────────┘
               │ Notificacion + Email (Brevo/n8n)
               ▼
[ENTREVISTA TEORICA — Llamada IA con voz humana]
  4 perfiles de entrevistador disponibles
  Max 4 entrevistas simultaneas
  El agente asigna el perfil segun desempeno previo
               │
               ▼
┌───────────────────────────────┐
│  AGENTE IA — EVALUACION       │
│  Puntaje >= 75% → APROBADO    │
│  Ejemplo: 16 candidatos       │
│           → 5 aprobados       │
└──────────────┬────────────────┘
               │
               ▼
[ENTREVISTA TECNICA — Caso practico segun carrera]
  Programadores: coding challenge en vivo
  Abogados: caso legal contextualizado a Peru
  Diseñadores: ejercicio de diseño
  + Grabacion de pantalla obligatoria
  + No se puede cambiar de ventana (anti-cheat)
  + Video grabado y subido a AWS S3
               │
               ▼
┌───────────────────────────────┐
│  REPORTE FINAL A LA EMPRESA   │
│  - Perfiles aprobados         │
│  - Preguntas realizadas       │
│  - Puntajes de cada etapa     │
│  - Video de la sesion (S3)    │
│  - Recomendacion del agente   │
└───────────────────────────────┘
```

---

### 7.2 Nuevos Bounded Contexts del Backend

Este pipeline requiere agregar dos nuevos bounded contexts al modular monolith:


---

### 7.3 Agente IA Python — Estructura Ampliada

```
ai-agent-service/                        # Python FastAPI — repo separado
│
├── screening/                           # Agente de screening y filtrado
│   ├── router.py
│   ├── screening_agent.py               # LangChain: compara perfil vs requisitos
│   ├── vector_store.py                  # pgvector: busqueda semantica de habilidades
│   └── scoring.py                       # Calcula score de afinidad candidato-puesto
│
├── theory_interview/                    # Agente de entrevista teorica
│   ├── router.py
│   ├── question_generator.py            # Genera preguntas segun carrera y puesto
│   ├── answer_evaluator.py              # Evalua respuestas y asigna puntaje 0-100
│   ├── session_manager.py               # Maneja el estado de la sesion en tiempo real
│   └── profile_selector.py              # Elige cual de los 4 perfiles de entrevistador usar
│
├── technical_interview/                 # Agente de entrevista tecnica
│   ├── router.py
│   ├── challenge_generator.py           # Genera caso practico segun carrera
│   │                                    # Programadores: coding | Abogados: caso legal Peru
│   │                                    # Diseñadores: brief de diseño | etc.
│   ├── code_evaluator.py                # Evalua codigo en tiempo real (sandbox seguro)
│   ├── legal_case_evaluator.py          # Evalua respuestas a casos legales
│   └── anti_cheat_monitor.py            # Detecta cambios de pantalla reportados por frontend
│
├── interviewer_profiles/                # Los 4 perfiles simulados de entrevistador
│   ├── profiles.py                      # Define nombre, personalidad, estilo de cada perfil
│   ├── voice_config.py                  # Asigna voz (MALE_1, MALE_2, FEMALE_1, FEMALE_2)
│   └── prompt_templates/
│       ├── profile_1_formal.txt         # Perfil 1: formal y directo
│       ├── profile_2_friendly.txt       # Perfil 2: amigable y exploratorio
│       ├── profile_3_technical.txt      # Perfil 3: muy tecnico y detallista
│       └── profile_4_strategic.txt      # Perfil 4: enfocado en pensamiento estrategico
│
├── report_generator/                    # Genera el reporte final para la empresa
│   ├── router.py
│   └── report_builder.py                # Compila preguntas, puntajes, recomendacion y link S3
│
├── shared/
│   ├── llm_client.py                    # Cliente OpenAI / Gemini configurable
│   ├── tts_client.py                    # ElevenLabs o AWS Polly para voz humana
│   └── s3_client.py                     # Sube videos de sesion a AWS S3
│
└── main.py
```

---

### 7.4 Integracion dentro de la misma estructura del Frontend

Correcto: **no conviene separar demasiado el frontend** si quieres entenderlo mejor y mantenerlo simple. La mejor decision aqui es **integrar todo dentro de las features que ya existen**, no crear una arquitectura paralela.

La idea final queda asi:

- `features/jobs/` sigue manejando publicaciones, postulaciones y estado del proceso para la empresa
- `features/profile/` sigue mostrando el avance del candidato en sus evaluaciones
- `features/notifications/` sigue manejando avisos, mensajes y cambios de etapa
- La logica de entrevista se agrega dentro de `features/jobs/` porque nace desde una postulacion a un puesto

### Estructura ajustada del Frontend
#### Con esta decision ganas 3 cosas

1. **Menos dispersion mental** — todo lo relacionado a empleos, postulaciones y entrevistas vive principalmente en `features/jobs/`.
2. **Menos carpetas nuevas** — la estructura sigue limpia y facil de entender.
3. **Mejor trazabilidad funcional** — una vacante, sus postulantes, su pipeline y su resultado final viven en el mismo modulo del frontend.

Entonces, tu intuicion es correcta: **es mejor integrarlo a la misma estructura del frontend** para este proyecto de 3 meses.

---
### 7.5 Logica Anti-Cheat en el Frontend

```typescript
// features/interview/hooks/useAntiCheat.ts
// Detecta cuando el candidato cambia de pestaña o minimiza la ventana

import { useEffect, useRef } from "react";
import { interviewApi } from "../api/interviewApi";

interface UseAntiCheatOptions {
  interviewId: string;
  onViolation: (count: number) => void;  // Callback cuando detecta trampa
  maxViolations?: number;                 // Por defecto 3 — al 4to se aborta la sesion
}

export function useAntiCheat({ interviewId, onViolation, maxViolations = 3 }: UseAntiCheatOptions) {
  const violationCount = useRef(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        violationCount.current += 1;

        // Reporta la violacion al backend — queda registrada en el reporte final
        interviewApi.reportViolation(interviewId, {
          type: "TAB_SWITCH",
          count: violationCount.current,
          timestamp: new Date().toISOString(),
        });

        onViolation(violationCount.current);

        if (violationCount.current >= maxViolations) {
          // La sesion se aborta automaticamente
          interviewApi.abortSession(interviewId, "MAX_VIOLATIONS_REACHED");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [interviewId, onViolation, maxViolations]);

  return { violationCount: violationCount.current };
}
```

```typescript
// features/interview/hooks/useScreenRecording.ts
// Graba la pantalla del candidato durante toda la sesion

import { useRef, useState } from "react";
import { uploadToS3 } from "@/shared/lib/s3Helpers";

export function useScreenRecording(interviewId: string) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    // Solicita permiso para grabar pantalla
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 15 },   // 15fps es suficiente, reduce el peso del video
      audio: true,
    });

    const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `interview-${interviewId}.webm`, { type: "video/webm" });

      // Sube directamente a S3 — el link queda en el reporte de la empresa
      const fileKey = await uploadToS3(file, "interview-recordings");
      await interviewApi.saveRecordingKey(interviewId, fileKey);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(5000);  // Guarda en chunks de 5 segundos
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return { startRecording, stopRecording, isRecording };
}
```

---

### 7.6 Control de Concurrencia — 4 Entrevistas Simultaneas

El sistema solo puede atender 4 entrevistas al mismo tiempo porque tiene 4 perfiles de entrevistador disponibles. Esto se controla en el backend con un semaforo:

```java
// InterviewSlotManager.java — en interview/infrastructure/concurrency/
@Component
public class InterviewSlotManager {

    private static final int MAX_CONCURRENT_INTERVIEWS = 4;

    // Semaforo con 4 permisos — uno por perfil disponible
    private final Semaphore semaphore = new Semaphore(MAX_CONCURRENT_INTERVIEWS, true);

    // Mapa de slot -> perfil asignado (perfil 1, 2, 3 o 4)
    private final Map<Integer, String> activeSlots = new ConcurrentHashMap<>();

    public Optional<Integer> acquireSlot(String interviewId) {
        if (!semaphore.tryAcquire()) {
            return Optional.empty();  // No hay slots disponibles, el candidato espera en cola
        }

        // Encuentra el slot libre (1-4)
        for (int slot = 1; slot <= MAX_CONCURRENT_INTERVIEWS; slot++) {
            if (!activeSlots.containsKey(slot)) {
                activeSlots.put(slot, interviewId);
                return Optional.of(slot);
            }
        }
        semaphore.release();
        return Optional.empty();
    }

    public void releaseSlot(String interviewId) {
        activeSlots.entrySet().removeIf(entry -> entry.getValue().equals(interviewId));
        semaphore.release();
    }

    public int availableSlots() {
        return semaphore.availablePermits();
    }
}
```

---

### 7.7 Los 4 Perfiles de Entrevistador IA

El agente selecciona automaticamente el perfil mas adecuado basandose en el puntaje y estilo de respuestas del candidato en la entrevista teorica:

| Perfil | Nombre | Genero | Estilo | Voz | Cuando se asigna |
|---|---|---|---|---|---|
| Perfil 1 | Carlos Mendoza | Masculino | Formal y directo. Preguntas cortas y precisas | MALE_1 | Candidatos con respuestas concisas y tecnicas |
| Perfil 2 | Ana Quispe | Femenino | Amigable y exploratorio. Profundiza con "por que" | FEMALE_1 | Candidatos con respuestas extensas y narrativas |
| Perfil 3 | Diego Torres | Masculino | Muy tecnico y detallista. Pide ejemplos especificos | MALE_2 | Candidatos con alto puntaje en conceptos tecnicos |
| Perfil 4 | Sofia Vargas | Femenino | Estrategico. Enfocado en impacto y decision | FEMALE_2 | Candidatos con perfil de liderazgo o senior |

---

### 7.8 Flujo de Datos Completo del Pipeline

```
1. EMPRESA crea JobPost
   └─ job-service guarda el puesto
   └─ JobPublishedEvent → Kafka

2. CANDIDATOS postulan (ej: 30)
   └─ job-service guarda las aplicaciones
   └─ ApplicationSubmittedEvent → Kafka → hiring-service

3. SCREENING IA (Python FastAPI)
   └─ hiring-service llama a /screening/evaluate con los 30 perfiles
   └─ Agente compara con pgvector los skills del puesto vs candidatos
   └─ Devuelve top 16 con score y justificacion
   └─ ScreeningCompletedEvent → Kafka
   └─ notification-service → Brevo envia email a los 16 seleccionados
                           → n8n envia notificacion push en la app

4. ENTREVISTA TEORICA (max 4 simultaneas)
   └─ interview-service.acquireSlot() → asigna slot y perfil
   └─ WebSocket abierto: candidato <-> agente IA
   └─ Python genera preguntas segun carrera
   └─ TTS (ElevenLabs/Polly) convierte preguntas a voz humana
   └─ Candidato responde por voz o texto
   └─ Agente evalua cada respuesta en tiempo real
   └─ Al finalizar: puntaje calculado, slot liberado
   └─ Si puntaje >= 75%: TheoryInterviewPassedEvent → Kafka

5. ENTREVISTA TECNICA (misma logica de slots)
   └─ Agente genera caso practico segun carrera del candidato
   └─ Frontend activa grabacion de pantalla (MediaRecorder API)
   └─ Anti-cheat activo: detecta cambios de pestaña
   └─ Al finalizar: video subido a AWS S3
   └─ TechnicalInterviewDoneEvent → Kafka → hiring-service

6. REPORTE FINAL
   └─ hiring-service genera reporte consolidado:
      · Perfiles aprobados con scores por etapa
      · Preguntas realizadas y respuestas
      · Link al video S3 de cada sesion
      · Recomendacion del agente IA
   └─ notification-service → Brevo envia reporte PDF a la empresa
   └─ Dashboard de la empresa muestra el reporte en tiempo real
```

---

### 7.9 Nuevas Variables de Entorno Requeridas

```bash
# .env (backend)
# IA y voz
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...           # Para las 4 voces humanas
ELEVENLABS_VOICE_MALE_1=...      # ID de voz Carlos Mendoza
ELEVENLABS_VOICE_MALE_2=...      # ID de voz Diego Torres
ELEVENLABS_VOICE_FEMALE_1=...    # ID de voz Ana Quispe
ELEVENLABS_VOICE_FEMALE_2=...    # ID de voz Sofia Vargas

# S3 (grabaciones de entrevistas)
AWS_S3_RECORDINGS_BUCKET=achanvear-recordings
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Entrevistas
MAX_CONCURRENT_INTERVIEWS=4
THEORY_PASS_SCORE_THRESHOLD=75
SCREENING_MAX_CANDIDATES=16
```

---

## 5. Roadmap de 3 Meses

### Mes 1 — Fundacion (Semanas 1-4)

**Backend:**
- Setup del proyecto Spring Boot con estructura DDD completa
- Docker Compose local con Postgres + Redis
- Modulo `identity`: User, Email, UserRole, UserFactory, UserRegisteredEvent
- Endpoints: POST /register, POST /login, GET /me
- JWT RS256 con Spring Security
- Configuracion de Flyway para migraciones
- Deploy inicial en Render con Neon como base de datos
- Integracion con Brevo para email de bienvenida via n8n

**Frontend:**
- Setup de Next.js 15 con TypeScript, Tailwind, TanStack Query, Zustand
- Feature `auth`: LoginForm, RegisterForm, RoleSelector
- Shared UI: Button, Input, Select, Modal, Badge, Avatar, Skeleton, EmptyState
- `axiosClient.ts` con JWT interceptor
- AuthGuard y layout del dashboard
- Deploy en Vercel conectado a Render

### Mes 2 — Core del Negocio (Semanas 5-8)

**Backend:**
- Modulo `jobs`: JobPost, JobType, JobApplication, ApplicationStatus
- Endpoints CRUD de empleos con paginacion y filtros
- JobPublishedEvent via Kafka → notificacion a candidatos
- Modulo `freelance`: FreelanceProject, Proposal, Milestone
- Modulo `profile`: TalentProfile, Skill, ReputationScore
- Integracion con AWS S3 para subida de imagenes y CVs (URLs presignadas)
- Agente IA Python FastAPI: matching basico de perfiles

**Frontend:**
- Feature `jobs`: JobCard, JobList, JobFilters, JobForm, ApplicationModal
- Feature `freelance`: ProjectCard, ProposalForm, MilestoneTracker
- Feature `profile`: ProfileHeader, SkillsSection, PortfolioSection, ReputationBadge
- Subida de imagenes a S3 con `s3Helpers.ts`

### Mes 3 — Pagos, Pulido y Lanzamiento (Semanas 9-12)

**Backend:**
- Modulo `payments`: Payment, CommissionPolicy (3-5%, primer proyecto gratis), Wallet
- Integracion con Mercado Pago (tarjetas, Yape, transferencias)
- Planes premium para empresas
- Tests de integracion con `@SpringBootTest`
- Optimizacion de queries con indices en PostgreSQL
- Migracion de Render a AWS App Runner (produccion)

**Frontend:**
- Feature `payments`: WalletBalance, TransactionList, CommissionBadge
- Feature `notifications`: NotificationBell, WebSocket con useNotifications
- E2E tests con Playwright para flujos criticos
- Lighthouse audit: Performance > 90
- Configuracion de Cloudflare para dominio, CDN y SSL

---

## 6. Checklist de Buenas Practicas

### Backend
- [ ] Ningun `import org.springframework.*` dentro de `domain/`
- [ ] Los controllers solo llaman al use case — cero logica de negocio en el controller
- [ ] Constructor injection en todos los servicios — nunca `@Autowired` en campos
- [ ] `@Transactional` solo en `application/`, nunca en `domain/`
- [ ] Domain Events se publican DESPUES del `repository.save()`, no antes
- [ ] Todos los metodos publicos del dominio tienen unit tests
- [ ] Variables de entorno sensibles en `.env` — nunca hardcodeadas en el codigo
- [ ] Ningun caracter especial (tilde, enye) en nombres de clases, metodos o paquetes

### Frontend
- [ ] Ningun `fetch()` directo en componentes — siempre via custom hook
- [ ] Ningun import entre features (cross-feature isolation)
- [ ] Todos los formularios usan Zod schema + React Hook Form
- [ ] `"strict": true` en tsconfig — prohibir tipos `any`
- [ ] Skeleton loaders en todos los estados de carga
- [ ] Empty states en todos los listados
- [ ] Variables de entorno en `.env.local` — nunca en el codigo
- [ ] URLs de S3 siempre via URLs presignadas — nunca exponer claves de AWS al cliente

