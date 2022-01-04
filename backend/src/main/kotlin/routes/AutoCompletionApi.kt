package routes

import instance
import io.ktor.application.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.Serializable
import model.dao.Order
import model.dao.UserAuth
import model.tables.UserAuthTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.Role

fun Route.autoCompletionApi() = route("completion") {
    val db: Database by instance()
    authenticate(Role.USER) {
        get("all") {
            val result = transaction(db) {
                val completion: Completion = Completion(
                    productColumn = mutableSetOf(),
                    commissionColumn = mutableSetOf(),
                    clientColumn = mutableSetOf(),
                    clientOrderCodeColumn = mutableSetOf(),
                    productCodeColumn = mutableSetOf(),
                    rawCodeColumn = mutableSetOf(),
                    operatorColumn = mutableSetOf(),
                    externalTreatmentsColumn = mutableSetOf(),
                )
                Order.all().forEach {
                    completion.populateCompletion(it.serialize())

                }
                completion.operatorColumn.addAll(UserAuth.find { UserAuthTable.role eq "USER" }.map { it.username }.toList())
                completion
            }
            call.respond(result)
        }
    }
}

fun Completion.populateCompletion(serializableOrder: SerializableOrder) {
    this.productColumn.add(serializableOrder.product)
    this.commissionColumn.add(serializableOrder.commission)
    this.clientColumn.add(serializableOrder.client)
    this.clientOrderCodeColumn.add(serializableOrder.clientOrderCode)

    serializableOrder.internalOrders.forEach {
        this.productCodeColumn.add(it.productCode)
        this.rawCodeColumn.add(it.rawCode)
        if (it.externalTreatments != null) this.externalTreatmentsColumn.add(it.externalTreatments)
    }


}

@Serializable
data class Completion(
    val productColumn: MutableSet<String>,
    val commissionColumn: MutableSet<String>,
    val clientColumn: MutableSet<String>,
    val clientOrderCodeColumn: MutableSet<String>,
    val productCodeColumn: MutableSet<String>,
    val rawCodeColumn: MutableSet<String>,
    val operatorColumn: MutableSet<String>,
    val externalTreatmentsColumn: MutableSet<String>,
)
