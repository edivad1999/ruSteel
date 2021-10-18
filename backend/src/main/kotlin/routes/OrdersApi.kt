package routes

import instance
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.datetime.Clock
import kotlinx.serialization.Serializable
import model.dao.InternalOrder
import model.dao.Order
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import qr.OrderPDF
import routes.auth.Role
import java.util.*

fun Route.orderApi() = route("order") {

    val db: Database by instance()
    authenticate(Role.USER) {
        get("id") {
            val id = call.parameters["id"]!!.toUUID()
            val result = transaction(db) {
                Order.findById(id)?.serialize()
            }
            if (result != null) {
                call.respond(result)
            } else {
                call.respond(HttpStatusCode.BadRequest)
            }

        }
        get("all") {
            val result = transaction(db) {
                Order.all().sortedBy { order: Order -> order.creationTime }.map {
                    it.serialize()
                }
            }
            call.respond(result)

        }
        get("remove") {
            val id = call.parameters["id"]!!.toUUID()
            val result = transaction(db) {

                val order = Order.findById(id)
                if (order !== null) {
                    order.internalOrders.toList().forEach { it.delete() }
                    order.delete()

                }
                order != null

            }
            call.respond(if (result) HttpStatusCode.OK else HttpStatusCode.BadRequest)

        }
        post("edit") {
            val request = call.receive<SerializableOrder>()
            val id = call.parameters["id"]!!.toUUID()
            transaction(db) {
                var result = false


                val order = Order.findById(id)!!

                order.product = request.product
                order.requestedDate = request.requestedDate
                order.requestedQuantity = request.requestedQuantity
                order.commission = request.commission
                order.client = request.client
                order.clientOrderCode = request.clientOrderCode

                request.internalOrders.forEach {
                    val internalOrder = InternalOrder.findById(it.id.toUUID())
                    if (internalOrder != null) {
                        internalOrder.productCode = it.productCode
                        internalOrder.productQuantity = it.productQuantity
                        internalOrder.rawCode = it.rawCode
                        internalOrder.rawQuantity = it.rawQuantity
                        internalOrder.operator = it.operator
                        internalOrder.externalTreatments = it.externalTreatments
                        internalOrder.startDate = it.startDate
                        internalOrder.endDate = it.endDate
                        internalOrder.expectedEndDate = it.expectedEndDate
                        internalOrder.orderPrincipal = order.id
                        internalOrder.setProcesses(it.processes ?: emptyList<String>())
                    } else {
                        InternalOrder.new {
                            productCode = it.productCode
                            productQuantity = it.productQuantity
                            rawCode = it.rawCode
                            rawQuantity = it.rawQuantity
                            operator = it.operator
                            externalTreatments = it.externalTreatments
                            orderPrincipal = order.id
                            startDate = it.startDate
                            endDate = it.endDate
                            expectedEndDate = it.expectedEndDate
                            setProcesses(it.processes ?: emptyList<String>())
                        }
                    }

                }
                result = true
                result
            }.let {
                val result = transaction(db) {
                    Order.findById(id)?.serialize()
                }
                if (result != null) {
                    call.respond(result)
                } else {
                    call.respond(HttpStatusCode.BadRequest)
                }


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
        post("new") {
            val request = call.receive<CreateSerializableOrderRequest>()

            transaction(db) {
                val newOrder = Order.new {
                    product = request.product
                    requestedDate = request.requestedDate
                    requestedQuantity = request.requestedQuantity
                    commission = request.commission
                    client = request.client
                    clientOrderCode = request.clientOrderCode

                    creationTime = System.currentTimeMillis()

                }
                request.internalOrders.forEach {
                    InternalOrder.new {
                        startDate = it.startDate
                        endDate = it.endDate
                        expectedEndDate = it.expectedEndDate
                        productCode = it.productCode
                        productQuantity = it.productQuantity
                        rawCode = it.rawCode
                        rawQuantity = it.rawQuantity
                        operator = it.operator
                        externalTreatments = it.externalTreatments
                        orderPrincipal = newOrder.id
                        setProcesses(it.processes ?: emptyList<String>())
                    }
                }
                newOrder.id
            }.let {
                val result = transaction(db) {
                    Order.findById(it.value)?.serialize()
                }
                if (result != null) {
                    call.respond(result)
                } else {
                    call.respond(HttpStatusCode.BadRequest)
                }

            }
        }
    }
}

private fun String.toUUID(): UUID {
    return try {
        UUID.fromString(this)
    }catch (e:Exception){
        UUID.randomUUID()
    }
}
//TODO save in db the creation time of every order so just /new api

fun Order.serialize(): SerializableOrder {
    return SerializableOrder(
        id = this.id.value.toString(),
        product = this.product,
        requestedDate = this.requestedDate,
        requestedQuantity = this.requestedQuantity,
        commission = this.commission,
        client = this.client,
        clientOrderCode = this.clientOrderCode,

        internalOrders = this.internalOrders.toList().map { it.serialize() },
    )
}


fun InternalOrder.serialize(): SerializableInternalOrder {
    return SerializableInternalOrder(
        id = this.id.value.toString(),
        productCode = this.productCode,
        productQuantity = this.productQuantity,
        rawCode = this.rawCode,
        rawQuantity = this.rawQuantity,
        operator = this.operator,
        startDate = this.startDate,
        endDate = this.endDate,
        expectedEndDate = this.expectedEndDate,
        processes = this.getProcesses(),
        externalTreatments = this.externalTreatments
    )
}

@Serializable
data class SerializableOrder(
    val id: String,
    val product: String,
    val requestedDate: Long,
    val requestedQuantity: Int,
    val commission: String,
    val client: String,
    val clientOrderCode: String,

    val internalOrders: List<SerializableInternalOrder>,
)

@Serializable
data class SerializableInternalOrder(
    val id: String,
    val productCode: String,
    val productQuantity: Int,
    val rawCode: String,
    val rawQuantity: Int,
    val operator: String,
    val processes: List<String>? = emptyList<String>(),
    val startDate: Long? = null,
    val endDate: Long? = null,
    val expectedEndDate: Long? = null,
    val externalTreatments: String? = null,


    )

@Serializable
data class CreateSerializableOrderRequest(
    val product: String,
    val requestedDate: Long,
    val requestedQuantity: Int,
    val commission: String,
    val client: String,
    val clientOrderCode: String,

    val internalOrders: List<CreateSerializableInternalOrderRequest>,
)

@Serializable
data class CreateSerializableInternalOrderRequest(
    val productCode: String,
    val productQuantity: Int,
    val rawCode: String,
    val rawQuantity: Int,
    val operator: String,
    val processes: List<String>? = emptyList<String>(),
    val startDate: Long? = null,
    val endDate: Long? = null,
    val expectedEndDate: Long? = null,
    val externalTreatments: String? = null,


    )

@Serializable
data class SerializableProcess(
    val id: Int,
    val process: String,
)
