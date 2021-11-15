package routes

import instance
import io.ktor.application.*
import io.ktor.http.*
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
                Process.all().map { it.process }.sorted()
            }
            call.respond(result)
        }
        get("new") {
            val name = call.parameters["name"]!!
            val result = transaction(db) {
                Process.new {
                    this.process = name
                }
            }.apply {
                call.respond(HttpStatusCode.OK)

            }
        }
        get("remove") {
            val name = call.parameters["name"]!!
            val result = transaction(db) {
                Process.all().forEach {
                    if (it.process == name) {
                        it.delete()
                        var done = true
                    }
                }
            }.apply {
                call.respond(HttpStatusCode.OK)

            }

        }
    }
}

