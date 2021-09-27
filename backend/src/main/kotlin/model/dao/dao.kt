package model.dao

import model.tables.InternalOrdersTable
import model.tables.OrdersTable
import model.tables.ProcessesTable
import model.tables.UserAuthTable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import routes.auth.Role

class UserAuth(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<UserAuth>(
        UserAuthTable
    )

    var username by UserAuthTable.username
    var hashPass by UserAuthTable.hashPass
    var role by UserAuthTable.role

    fun getRole(): Role = Role.valueOf(role)

}

class Order(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Order>(
        OrdersTable
    )

    var product by OrdersTable.product
    var requestedDate by OrdersTable.requestedDate
    var requestedQuantity by OrdersTable.requestedQuantity
    var commission by OrdersTable.commission
    var client by OrdersTable.client
    var clientOrderCode by OrdersTable.clientOrderCode
    var startDate by OrdersTable.startDate
    var endDate by OrdersTable.endDate
    var expectedEndDate by OrdersTable.expectedEndDate
    private val internalOrders by InternalOrder referrersOn InternalOrdersTable.orderPrincipal
    fun getInternalOrders() = internalOrders.toList()

}

class InternalOrder(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<InternalOrder>(
        InternalOrdersTable
    )

    var productCode by InternalOrdersTable.productCode
    var productQuantity by InternalOrdersTable.productQuantity
    var rawCode by InternalOrdersTable.rawCode
    var rawQuantity by InternalOrdersTable.rawQuantity
    var operator by InternalOrdersTable.operator
    private var processes by InternalOrdersTable.processes
    var externalTreatments by InternalOrdersTable.externalTreatments


    var orderPrincipal by InternalOrdersTable.orderPrincipal

    fun getProcesses() = processes.replace("\\s".toRegex(), "").split(',')
    fun setProcesses(proc: List<String>) {
        processes = proc.joinToString(", ")
    }
}

class Process(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Process>(
        ProcessesTable
    )

    var process by ProcessesTable.process
}
