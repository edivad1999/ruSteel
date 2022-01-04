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
import model.dao.Process
import model.dao.UserAuth
import model.tables.InternalOrdersTable
import model.tables.UserAuthTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.Role
import utils.ExcelUtils
import java.util.*

fun Route.orderApi() = route("order") {

    val db: Database by instance()
    authenticate(Role.ADMIN) {
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
                Order.all().sortedByDescending { order: Order -> order.creationTime }.map {
                    it.serialize()
                }
            }
            call.respond(result)

        }
        get("excel") {
            val processes = transaction(db) {
                Process.all().map { it.process }.sorted()

            }
            val order = transaction(db) {
                Order.all().map { it.serialize() }
            }
            val excel = ExcelUtils()
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, "excel")
                    .toString()
            )
            val file = excel.createExcel(order, processes)

            call.respondFile(file)

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

                order.internalOrders.forEach { internal ->
                    var found = false
                    request.internalOrders.forEach {
                        if (it.id.toUUID() == internal.id.value) {
                            found = true
                        }
                    }
                    if (!found) {
                        internal.delete()
                    }
                }

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
                        internalOrder.priority = it.priority
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
                            priority = it.priority

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

        get("setOperatorInternal") {
            val internalId = UUID.fromString(call.parameters["id"]!!)
            val operator = call.parameters["operator"]!!
            transaction(db) {
                UserAuth.find {
                    UserAuthTable.username eq operator
                }.firstOrNull().apply {
                    if (this != null) {
                        InternalOrder.findById(internalId).let {
                            if (it != null) {
                                it.operator = this.username
                            }
                        }
                    }
                }
            }
            call.respond(HttpStatusCode.OK)
        }
        get("internal") {
            val id = UUID.fromString(call.parameters["id"]!!)
            transaction(db) {
                InternalOrder.findById(id)?.serialize()
            }.apply {
                call.respond(this ?: HttpStatusCode.BadRequest)
            }
        }
        post("setInternal") {
            val req = call.receive<SetInternalRequest>()
            transaction(db) {
                InternalOrder.findById(req.id.toUUID())!!.apply {
                    if (req.action == "end") {
                        this.endDate = req.date
                    } else {
                        this.startDate = req.date

                    }
                }

            }.apply {
                call.respond(HttpStatusCode.OK)
            }
        }

        get("operators") {
            transaction(db) {
                UserAuth.all().toList().filter { it.getRole() === Role.USER }.map { user ->
                    val internal = InternalOrder.find { InternalOrdersTable.operator eq user.username }.toList()
                    OperatorData(
                        name = user.username,
                        assignedOrders = internal.size,
                        completedOrders = internal.count { it.endDate != null },
                        inProgressOrders = internal.count { it.startDate != null && it.endDate == null },
                        notStartedOrders = internal.count { it.startDate == null && it.endDate == null },
                    )
                }
            }.apply {
                call.respond(this.sortedBy { it.name })
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
                        priority = it.priority
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

public fun String.toUUID(): UUID {
    return try {
        UUID.fromString(this)
    } catch (e: Exception) {
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

        creationTime = this.creationTime,
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
        externalTreatments = this.externalTreatments,
        priority = this.priority

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
    val creationTime: Long? = null,
    val internalOrders: List<SerializableInternalOrder>,
)

@Serializable
data class SetInternalRequest(
    val id: String,
    val action: String,
    val date: Long,
)

@Serializable
data class SerializableInternalOrder(
    val id: String,
    val productCode: String,
    val productQuantity: Int,
    val rawCode: String,
    val rawQuantity: Int,
    val operator: String? = null,
    val processes: List<String>? = emptyList<String>(),
    val startDate: Long? = null,
    val endDate: Long? = null,
    val expectedEndDate: Long? = null,
    val externalTreatments: String? = null,
    val priority: Int? = null,


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
    val operator: String? = null,
    val processes: List<String>? = emptyList<String>(),
    val startDate: Long? = null,
    val endDate: Long? = null,
    val expectedEndDate: Long? = null,
    val externalTreatments: String? = null,
    val priority: Int? = null,


    )

@Serializable
data class SerializableProcess(
    val id: Int,
    val process: String,
)

@Serializable
data class OperatorData(

    val name: String,
    val assignedOrders: Int,
    val completedOrders: Int,
    val inProgressOrders: Int,
    val notStartedOrders: Int,
)



