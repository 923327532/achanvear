import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner entrada = new Scanner(System.in);
        double a = entrada.nextDouble();
        String operador = entrada.next();
        double b = entrada.nextDouble();
        switch (operador) {
            case "+": System.out.println(a + b); break;
            case "-": System.out.println(a - b); break;
            case "*": System.out.println(a * b); break;
            case "/":
                if (b == 0) System.out.println("No se puede dividir entre cero");
                else System.out.println(a / b);
                break;
            default: System.out.println("Operador invalido");
        }
        entrada.close();
    }
}
