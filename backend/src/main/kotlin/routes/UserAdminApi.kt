package routes


import instance
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.Serializable
import model.dao.UserAuth
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.Base64Encoder
import routes.auth.BasePrincipal
import routes.auth.PasswordDigester
import routes.auth.Role

fun Route.userAdminApi() = route("admin") {
    val db: Database by instance("APPLICATION")
    val digester: PasswordDigester by instance()
    val b64: Base64Encoder by instance()

    authenticate(Role.USER) {
        post("changePassword") {
            val req = call.receive<PasswordChangeRequest>()
            val res = transaction(db) {

                val user = UserAuth.findById(call.principal<BasePrincipal>()!!.userId.toInt())
                if (user != null && user.hashPass == req.old) {
                    user.hashPass = req.new
                }
                (user != null && user.hashPass == req.old)
            }
            if (res) {
                call.respond(HttpStatusCode.OK)

            } else {
                call.respond(HttpStatusCode.BadRequest)
            }

        }

        /**
         * In this specific application userId is same that Role
         * we can just respond username in token
         */
        get("getRole") {
            call.respond(SimpleStringResponse(call.principal<BasePrincipal>()!!.userId))
        }
    }
}

@Serializable
data class SimpleStringResponse(val responseString: String)

@Serializable
data class PasswordChangeRequest(
    val old: String,
    val new: String,
)
