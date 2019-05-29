package com.jalisco.seguridmap.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String CIUDADANO = "ROLE_CIUDADANO";

    public static final String INVESTIGADOR = "ROLE_INVESTIGADOR";


    private AuthoritiesConstants() {
    }
}
