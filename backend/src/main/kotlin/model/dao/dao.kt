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

class Orders(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Orders>(
        OrdersTable
    )

    val product by OrdersTable.product
    val requestedDate by OrdersTable.requestedDate
    val requestedQuantity by OrdersTable.requestedQuantity
    val order by OrdersTable.order
    val client by OrdersTable.client
    val clientOrderCode by OrdersTable.clientOrderCode
    val startDate by OrdersTable.startDate
    val endDate by OrdersTable.endDate
    val expectedEndDate by OrdersTable.expectedEndDate
    private val internalOrders by InternalOrders referrersOn InternalOrdersTable.orderPrincipal
    fun getInternalOrders() = internalOrders.toList()
}

class InternalOrders(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<InternalOrders>(
        InternalOrdersTable
    )

    var productCode by InternalOrdersTable.productCode
    var productQuantity by InternalOrdersTable.productQuantity
    var rawCode by InternalOrdersTable.rawCode
    var rawQuantity by InternalOrdersTable.rawQuantity
    var operator by InternalOrdersTable.operator
    private var processes by InternalOrdersTable.processes

    val orderPrincipal = InternalOrdersTable.orderPrincipal

    fun getProcesses() = processes.replace("\\s".toRegex(), "").split(',')
    fun setProcesses(proc: List<String>) {
        processes = proc.joinToString(", ")
    }
}

class Processes(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Processes>(
        ProcessesTable
    )

    var process by ProcessesTable.process
}
