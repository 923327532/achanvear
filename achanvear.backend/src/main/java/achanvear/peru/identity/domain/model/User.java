package achanvear.peru.identity.domain.model;

import achanvear.peru.identity.domain.event.UserRegisteredEvent;
import achanvear.peru.shared.domain.AggregateRoot;

import java.util.Objects;

public class User extends AggregateRoot<UserId> {

    private final UserId id;
    private final Email email;
    private String fullName;
    private String dni;
    private String phone;
    private String passwordHash;
    private UserRole role;
    private UserStatus status;
    private String representanteDni;
    private String representanteLegal;
    private String ruc;

    private User(
            UserId id,
            Email email,
            String fullName,
            String dni,
            String phone,
            String passwordHash,
            UserRole role,
            UserStatus status,
            String representanteDni,
            String representanteLegal,
            String ruc
    ) {
        this.id = Objects.requireNonNull(id, "User id cannot be null");
        this.email = Objects.requireNonNull(email, "Email cannot be null");
        this.fullName = fullName != null ? validateRequiredText(fullName, "Full name", 3, 150) : null;
        this.dni = dni != null ? validateDni(dni) : null;
        this.phone = phone != null ? validatePhone(phone) : null;
        this.passwordHash = validatePasswordHash(passwordHash);
        this.role = Objects.requireNonNull(role, "User role cannot be null");
        this.status = Objects.requireNonNull(status, "User status cannot be null");
        this.representanteDni = representanteDni;
        this.representanteLegal = representanteLegal;
        this.ruc = ruc;
    }

    public static User create(
            UserId id,
            Email email,
            String fullName,
            String dni,
            String phone,
            String passwordHash,
            UserRole role
    ) {
        return User.create(id, email, fullName, dni, phone, passwordHash, role, null, null, null);
    }

    public static User create(
            UserId id,
            Email email,
            String fullName,
            String dni,
            String phone,
            String passwordHash,
            UserRole role,
            String representanteDni,
            String representanteLegal,
            String ruc
    ) {
        User user = new User(
                id,
                email,
                fullName,
                dni,
                phone,
                passwordHash,
                role,
                UserStatus.ACTIVE,
                representanteDni,
                representanteLegal,
                ruc
        );

        user.registerEvent(UserRegisteredEvent.now(user.id, user.email, user.fullName, user.dni, user.phone, user.role));
        return user;
    }

    public static User restore(
            UserId id,
            Email email,
            String fullName,
            String dni,
            String phone,
            String passwordHash,
            UserRole role,
            UserStatus status,
            String representanteDni,
            String representanteLegal,
            String ruc
    ) {
        return new User(id, email, fullName, dni, phone, passwordHash, role, status, representanteDni, representanteLegal, ruc);
    }

    public void activate() {
        if (this.status != UserStatus.PENDING) {
            throw new IllegalStateException("User is not in pending status");
        }

        this.status = UserStatus.ACTIVE;
    }

    public void block() {
        if (this.status == UserStatus.DISABLED) {
            throw new IllegalStateException("Disabled user cannot be blocked");
        }

        this.status = UserStatus.BLOCKED;
    }

    public void disable() {
        this.status = UserStatus.DISABLED;
    }

    public void changeRole(UserRole newRole) {
        this.role = Objects.requireNonNull(newRole, "User role cannot be null");
    }

    public boolean isActive() {
        return this.status == UserStatus.ACTIVE;
    }

    public boolean hasRole(UserRole expectedRole) {
        return this.role == expectedRole;
    }

    public UserId getId() {
        return id;
    }

    public Email getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getDni() {
        return dni;
    }

    public String getPhone() {
        return phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getRepresentanteDni() {
        return representanteDni;
    }

    public String getRepresentanteLegal() {
        return representanteLegal;
    }

    public String getRuc() {
        return ruc;
    }

    private String validatePasswordHash(String passwordHash) {
        Objects.requireNonNull(passwordHash, "Password hash cannot be null");

        String normalizedValue = passwordHash.trim();
        if (normalizedValue.isBlank()) {
            throw new IllegalArgumentException("Password hash cannot be blank");
        }

        return normalizedValue;
    }

    private static String validateRequiredText(String value, String fieldName, int min, int max) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        String normalizedValue = value.trim();
        if (normalizedValue.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank");
        }

        if (normalizedValue.length() < min || normalizedValue.length() > max) {
            throw new IllegalArgumentException(fieldName + " length must be between " + min + " and " + max + " characters");
        }

        return normalizedValue;
    }

    private static String validateDni(String value) {
        Objects.requireNonNull(value, "Dni cannot be null");

        String normalizedValue = value.trim();
        if (!normalizedValue.matches("\\d{8}")) {
            throw new IllegalArgumentException("Dni must contain exactly 8 digits");
        }

        return normalizedValue;
    }

    private static String validatePhone(String value) {
        Objects.requireNonNull(value, "Phone cannot be null");

        String normalizedValue = value.trim();
        if (!normalizedValue.matches("\\d{9,15}")) {
            throw new IllegalArgumentException("Phone must contain between 9 and 15 digits");
        }

        return normalizedValue;
    }

    public void changePassword(String newPasswordHash) {
        this.passwordHash = validatePasswordHash(newPasswordHash);
        markUpdated();
    }
}