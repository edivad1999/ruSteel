package routes

import instance
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.Serializable
import model.dao.InternalOrder
import model.dao.Order
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.Role

fun Route.orderApi() = route("order") {

    val db: Database by instance()
    authenticate(Role.USER) {
        get("id") {
            val id = call.parameters["id"]!!.toInt()
            val result = transaction(db) {
                Order.findById(id)
            }
            if (result != null) {
                call.respond(result.serialize())
            } else {
                call.respond(HttpStatusCode.BadRequest)
            }

        }
        get("all") {
            val result = transaction(db) {
                Order.all().map {
                    it.serialize()
                }
            }
            call.respond(result)

        }
        get("remove") {
            val id = call.parameters["id"]!!.toInt()
            val result = transaction(db) {

                val order = Order.findById(id)
                if (order !== null) {
                    order.delete()
                    order.getInternalOrders().forEach { it.delete() }
                }
                order != null

            }
            call.respond(if (result) HttpStatusCode.OK else HttpStatusCode.BadRequest)

        }
        post("edit") {
            val request = call.receive<SerializableOrder>()
            val id = call.parameters["id"]!!.toInt()
            transaction(db) {
                var result = false


                val order = Order.findById(id)!!

                order.product = request.product
                order.requestedDate = request.requestedDate
                order.requestedQuantity = request.requestedQuantity
                order.commission = request.commission
                order.client = request.client
                order.clientOrderCode = request.clientOrderCode
                order.startDate = request.startDate
                order.endDate = request.endDate
                order.expectedEndDate = request.expectedEndDate
                request.internalOrders.forEach {
                    val internalOrder = InternalOrder.findById(it.id)
                    if (internalOrder != null) {
                        internalOrder.productCode = it.productCode
                        internalOrder.productQuantity = it.productQuantity
                        internalOrder.rawCode = it.rawCode
                        internalOrder.rawQuantity = it.rawQuantity
                        internalOrder.operator = it.operator
                        internalOrder.externalTreatments = it.externalTreatments
                        internalOrder.orderPrincipal = order.id.value
                        internalOrder.setProcesses(it.processes)
                    } else {
                        InternalOrder.new {
                            productCode = it.productCode
                            productQuantity = it.productQuantity
                            rawCode = it.rawCode
                            rawQuantity = it.rawQuantity
                            operator = it.operator
                            externalTreatments = it.externalTreatments
                            orderPrincipal = order.id.value
                            setProcesses(it.processes)
                        }
                    }

                }
                result = true
                result
            }.let {
                val result = transaction(db) {
                    Order.findById(id)
                }
                if (result != null) {
                    call.respond(result.serialize())
                } else {
                    call.respond(HttpStatusCode.BadRequest)
                }


            }
        }
        get("new") {
            val request = call.receive<SerializableOrder>()

            transaction(db) {
                val newOrder = Order.new {
                    product = request.product
                    requestedDate = request.requestedDate
                    requestedQuantity = request.requestedQuantity
                    commission = request.commission
                    client = request.client
                    clientOrderCode = request.clientOrderCode
                    startDate = request.startDate
                    endDate = request.endDate
                    expectedEndDate = request.expectedEndDate
                }
                request.internalOrders.forEach {
                    InternalOrder.new {
                        productCode = it.productCode
                        productQuantity = it.productQuantity
                        rawCode = it.rawCode
                        rawQuantity = it.rawQuantity
                        operator = it.operator
                        externalTreatments = it.externalTreatments
                        orderPrincipal = newOrder.id.value
                        setProcesses(it.processes)
                    }
                }
                newOrder.id
            }.let {
                val result = transaction(db) {
                    Order.findById(it.value)
                }
                if (result != null) {
                    call.respond(result.serialize())
                } else {
                    call.respond(HttpStatusCode.BadRequest)
                }

            }
        }
    }
}
//TODO make return new and edit the new id

fun Order.serialize(): SerializableOrder {
    return SerializableOrder(
        id = this.id.value,
        product = this.product,
        requestedDate = this.requestedDate,
        requestedQuantity = this.requestedQuantity,
        commission = this.commission,
        client = this.client,
        clientOrderCode = this.clientOrderCode,
        startDate = this.startDate,
        endDate = this.endDate,
        expectedEndDate = this.expectedEndDate,
        internalOrders = this.getInternalOrders().map { it.serialize() },
    )
}

fun InternalOrder.serialize(): SerializableInternalOrder {
    return SerializableInternalOrder(
        id = this.id.value,
        productCode = this.productCode,
        productQuantity = this.productQuantity,
        rawCode = this.rawCode,
        rawQuantity = this.rawQuantity,
        operator = this.operator,
        processes = this.getProcesses(),
        externalTreatments = this.externalTreatments
    )
}

@Serializable
data class SerializableOrder(
    val id: Int,
    val product: String,
    val requestedDate: Int,
    val requestedQuantity: Int,
    val commission: String,
    val client: String,
    val clientOrderCode: String,
    val startDate: Int,
    val endDate: Int,
    val expectedEndDate: Int,
    val internalOrders: List<SerializableInternalOrder>,
)

@Serializable
data class SerializableInternalOrder(
    val id: Int,
    val productCode: String,
    val productQuantity: Int,
    val rawCode: String,
    val rawQuantity: Int,
    val operator: String,
    val processes: List<String>,
    val externalTreatments: String,


    )

@Serializable
data class SerializableProcess(
    val id: Int,
    val process: String,
)
