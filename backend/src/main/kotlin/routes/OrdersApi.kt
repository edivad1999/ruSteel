package routes

import instance
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.Serializable
import model.dao.InternalOrders
import model.dao.Orders
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction

fun Route.orderApi() = route("order") {

    val db: Database by instance()
    get("id") {
        val id = call.parameters["id"]!!.toInt()
        val result = transaction(db) {
            Orders.findById(id)
        }
        if (result != null) {
            call.respond(result.serialize())
        } else {
            call.respond(HttpStatusCode.BadRequest)
        }

    }
    get("all") {
        val result = transaction(db) {
            Orders.all().map {
                it.serialize()
            }
        }
        call.respond(result)

    }
    get("remove") {

    }
    post("edit") {

    }
    post("new") {

    }
}

fun Orders.serialize(): SerializableOrders {
    return SerializableOrders(
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

fun InternalOrders.serialize(): SerializableInternalOrders {
    return SerializableInternalOrders(
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
data class SerializableOrders(
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
    val internalOrders: List<SerializableInternalOrders>,
)

@Serializable
data class SerializableInternalOrders(
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
data class SerializableProcesses(
    val id: Int,
    val process: String,
)
