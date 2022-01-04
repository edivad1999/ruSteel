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
import model.dao.Order
import model.dao.UserAuth
import model.tables.UserAuthTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.BasePrincipal
import routes.auth.Role
import utils.OrderPDF
import java.util.*

//
fun Route.operatorApi() = route("operator") {

    authenticate(Role.USER) {
        val db: Database by instance()
        get("myRole") {
            transaction(db) {
                UserAuth.find { UserAuthTable.username eq call.principal<BasePrincipal>()!!.userId }.firstOrNull().let {
                    it?.getRole()
                }
            }.apply {
                call.respond(SimpleStringResponse(this.toString()))
            }
        }
        get("whoAmI") {
            transaction(db) {
                UserAuth.find { UserAuthTable.username eq call.principal<BasePrincipal>()!!.userId }.firstOrNull().let {
                    it?.username
                }
            }.apply {
                call.respond(SimpleStringResponse(this.toString()))
            }
        }

        get("orders") {
            var operator: String = ""
            val username = call.parameters["username"]
            transaction(db) {
                operator = if (username == null) {
                    val found = UserAuth.find { UserAuthTable.username eq call.principal<BasePrincipal>()!!.userId }.firstOrNull()?.username
                    found ?: ""
                } else {
                    username
                }
                Order.all().toList().sortedByDescending { it.creationTime }.map { it.serialize() }
            }.let { dbOrders ->
                val orders = dbOrders.filter { it.internalOrders.any { ti -> ti.operator == operator } }.map {
                    SerializableOrder(
                        id = it.id,
                        product = it.product,
                        requestedDate = it.requestedDate,
                        requestedQuantity = it.requestedQuantity,
                        commission = it.commission,
                        client = it.client,
                        clientOrderCode = it.clientOrderCode,
                        internalOrders = it.internalOrders.filter { ti -> ti.operator == operator },
                        creationTime = it.creationTime
                    )
                }
                call.respond(orders)
            }

        }
        get("qr") {
            val id = UUID.fromString(call.parameters["id"]!!)
            transaction(db) {
                Order.findById(id)!!.serialize()
            }.let { order ->
                val orderPDF = OrderPDF(order)
                call.response.header(
                    HttpHeaders.ContentDisposition,
                    ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, "orderPdf${order.id.toString()}")
                        .toString()
                )
                val file = orderPDF.generatePdf()

                call.respondFile(file)
            }
        }
        post("editInternalOrderState") {
            val req = call.receive<EditProductionDate>()
            transaction(db) {
                InternalOrder.findById(req.id.toUUID()).let {
                    if (req.action == "reset") {
                        it?.startDate = null
                        it?.endDate = null

                    } else if (req.action == "start") {
                        it?.startDate = System.currentTimeMillis()
                        it?.endDate = null

                    } else if (req.action == "end") {
                        it?.endDate = System.currentTimeMillis()
                    }
                    it?.serialize()
                }

            }.apply {
                if (this != null) {
                    call.respond(this)
                } else call.respond(HttpStatusCode.BadRequest)
            }

        }
    }
}

@Serializable
data class EditProductionDate(
    val id: String,
    val action: String,
)
// Get ordersByOperator
// Operator set status
