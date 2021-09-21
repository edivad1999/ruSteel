package routes.auth

import com.auth0.jwt.*
import com.auth0.jwt.algorithms.*
import data.UserAuth
import kotlinx.serialization.Serializable
import java.util.*

object JwtConfig {

    private const val secret = "kAONETU3NEbekr934"
    private const val issuer = "Be4dot0Realm"
    private const val validityInMs = 3600000 // 1 hour
    private val algorithm = Algorithm.HMAC512(secret)

    val verifier: JWTVerifier = JWT
        .require(algorithm)
        .withIssuer(issuer)
        .build()

    /**
     * Produce a token for this combination of User and Account
     */
    fun makeToken(user: UserAuth): AuthTokenResponseData {
        val exp = getExpiration()
        val jwt = JWT.create()
            .withSubject("Authentication")
            .withIssuer(issuer)
            .withClaim("username", user.username)
            .withClaim("role", user.role)
            .withExpiresAt(exp)
            .sign(algorithm)
        return AuthTokenResponseData(jwt, exp.toInstant().toEpochMilli())
    }


    /**
     * Calculate the expiration Date based on current time + the given validity
     */
    private fun getExpiration() = Date(System.currentTimeMillis() + validityInMs)
}

@Serializable
data class AuthTokenResponseData(val jwt: String, val expAt: Long)
