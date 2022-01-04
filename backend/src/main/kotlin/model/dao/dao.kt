package model.dao

import model.tables.InternalOrdersTable
import model.tables.OrdersTable
import model.tables.ProcessesTable
import model.tables.UserAuthTable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import routes.auth.Role
import java.util.*

class UserAuth(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<UserAuth>(
        UserAuthTable
    )

    var username by UserAuthTable.username
    var hashPass by UserAuthTable.hashPass
    var role by UserAuthTable.role

    fun getRole(): Role = Role.valueOf(role)

}

class Order(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<Order>(
        OrdersTable
    )

    var product by OrdersTable.product
    var requestedDate: Long by OrdersTable.requestedDate
    var requestedQuantity by OrdersTable.requestedQuantity
    var commission by OrdersTable.commission
    var client by OrdersTable.client
    var clientOrderCode by OrdersTable.clientOrderCode

    var creationTime: Long by OrdersTable.creationTime
    val internalOrders by InternalOrder referrersOn InternalOrdersTable.orderPrincipal

}

class InternalOrder(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<InternalOrder>(
        InternalOrdersTable
    )

    var productCode by InternalOrdersTable.productCode
    var productQuantity by InternalOrdersTable.productQuantity
    var rawCode by InternalOrdersTable.rawCode
    var rawQuantity by InternalOrdersTable.rawQuantity
    var operator: String? by InternalOrdersTable.operator
    private var processes by InternalOrdersTable.processes
    var externalTreatments by InternalOrdersTable.externalTreatments
    var startDate: Long? by InternalOrdersTable.startDate
    var endDate: Long? by InternalOrdersTable.endDate
    var expectedEndDate: Long? by InternalOrdersTable.expectedEndDate
    var priority: Int? by InternalOrdersTable.priority
    var orderPrincipal: EntityID<UUID> by InternalOrdersTable.orderPrincipal

    fun getProcesses(): List<String> {
        val list = processes?.split(',')
        return if (list == null) {
            emptyList()
        } else {
            list.forEach { it.trim() }
            list
        }
    }

    fun setProcesses(proc: List<String>) {
        processes = if (proc.isNotEmpty()) {
            proc.joinToString(",")
        } else {
            null
        }
    }

    fun removeOperator() {
        this.operator = "RIMOSSO"
    }
}

class Process(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Process>(
        ProcessesTable
    )

    var process by ProcessesTable.process
}
