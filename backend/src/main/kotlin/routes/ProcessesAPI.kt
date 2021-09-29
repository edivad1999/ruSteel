package routes

import instance
import io.ktor.application.*
import io.ktor.response.*
import io.ktor.routing.*
import model.dao.Process
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.Role

fun Route.processesApi() = route("process") {
    val db: Database by instance()

    authenticate(Role.USER) {
        get("all") {
            val result = transaction(db) {
                Process.all().map { it.process }
            }
            call.respond(result)
        }
    }
}
