package routes


import instance
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.Serializable
import model.dao.InternalOrder
import model.dao.UserAuth
import model.tables.InternalOrdersTable
import model.tables.UserAuthTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.Base64Encoder
import routes.auth.BasePrincipal
import routes.auth.PasswordDigester
import routes.auth.Role

fun Route.userAdminApi() = route("admin") {
    val db: Database by instance()
    val digester: PasswordDigester by instance()
    val b64: Base64Encoder by instance()

    authenticate(Role.ADMIN) {

        post("newOperator") {
            val req = call.receive<OperatorRequest>()
            transaction(db) {
                UserAuth.new {
                    username = req.username
                    hashPass = digester.digest(b64.decodeString(req.password))
                    role = Role.USER.name
                }
            }
            call.respond(HttpStatusCode.OK)

        }
        post("changeOperatorPass") {
            val req = call.receive<OperatorPasswordChangeRequest>()
            val res = transaction(db) {

                val user = UserAuth.find { UserAuthTable.username eq req.username }.firstOrNull()
                if (user != null) {
                    user.hashPass = digester.digest(b64.decodeString(req.new))
                }
                (user != null)
            }
            if (res) {
                call.respond(HttpStatusCode.OK)

            } else {
                call.respond(HttpStatusCode.BadRequest)
            }
        }
        get("removeOperator") {
            val username = call.parameters["username"]!!
            transaction(db) {
                val found = UserAuth.find { UserAuthTable.username eq username }.firstOrNull()
                var hasOnlyCompletedOrders = false
                val operatorOrders = InternalOrder.find { InternalOrdersTable.operator eq username }
                hasOnlyCompletedOrders = operatorOrders.all { it.endDate != null }

                if (hasOnlyCompletedOrders && found != null) {
                    operatorOrders.forEach {
                        it.removeOperator()
                    }

                }
                found != null && hasOnlyCompletedOrders

            }.apply {
                if (this) {
                    transaction(db) {
                        val found = UserAuth.find { UserAuthTable.username eq username }.firstOrNull()!!
                        found.delete()

                    }
                }
                call.respond(if (this) HttpStatusCode.OK else HttpStatusCode.BadRequest)
            }

        }

        post("changePassword") {
            val req = call.receive<PasswordChangeRequest>()
            val res = transaction(db) {

                val user = UserAuth.find { UserAuthTable.username eq call.principal<BasePrincipal>()!!.userId }.firstOrNull()
                val pwdValid=user?.hashPass == digester.digest(b64.decodeString(req.old))
                if (user != null && pwdValid ) {
                    user.hashPass = digester.digest(b64.decodeString(req.new))
                }
                (user != null && pwdValid)
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

@Serializable
data class OperatorRequest(
    val username: String,
    val password: String,
)

@Serializable
data class OperatorPasswordChangeRequest(
    val username: String,
    val new: String,


    )
