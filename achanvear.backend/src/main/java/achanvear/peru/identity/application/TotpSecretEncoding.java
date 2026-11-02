package achanvear.peru.identity.application;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

public final class TotpSecretEncoding {
    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private TotpSecretEncoding() {}
    public static String encode(byte[] bytes) {
        var result = new StringBuilder();
        int buffer = 0, bits = 0;
        for (byte value : bytes) {
            buffer = (buffer << 8) | (value & 255); bits += 8;
            while (bits >= 5) { bits -= 5; result.append(ALPHABET.charAt((buffer >> bits) & 31)); }
        }
        if (bits > 0) result.append(ALPHABET.charAt((buffer << (5-bits)) & 31));
        return result.toString();
    }
    public static byte[] decodeStored(String stored) {
        // Existing accounts keep their legacy Base64 secret until they rotate it.
        if (!stored.startsWith("b32:")) return Base64.getDecoder().decode(stored);
        var bytes = new ByteArrayOutputStream();
        int buffer = 0, bits = 0;
        for (char character : stored.substring(4).toUpperCase(java.util.Locale.ROOT).toCharArray()) {
            if (character == '=') break;
            int value = ALPHABET.indexOf(character);
            if (value < 0) throw new IllegalArgumentException("Invalid Base32 secret");
            buffer = (buffer << 5) | value; bits += 5;
            if (bits >= 8) { bits -= 8; bytes.write((buffer >> bits) & 255); }
        }
        return bytes.toByteArray();
    }
}
