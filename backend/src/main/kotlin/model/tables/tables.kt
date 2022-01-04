package model.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.dao.id.UUIDTable
import routes.auth.Role

object UserAuthTable : IntIdTable("users", "id") {
    val username = varchar("username", 50).uniqueIndex()
    val hashPass = varchar("password", 200)
    val role = varchar("role", 50).default(Role.USER.name)

}

object OrdersTable : UUIDTable("orders", columnName = "id") {
    val product = varchar("product", 50)
    val requestedDate = long("requestedDate")
    val requestedQuantity = integer("requestedQuantity")
    val commission = varchar("commission", 50)
    val client = varchar("client", 50)
    val clientOrderCode = varchar("order", 50)

    val creationTime = long("creationTime")
}

object InternalOrdersTable : UUIDTable("internal-orders", columnName = "id") {
    val productCode = varchar("productCode", 50)
    val productQuantity = integer("productQuantity")
    val rawCode = varchar("rawCode", 50)
    val rawQuantity = integer("rawQuantity")
    val operator = optReference("operator", UserAuthTable.username)
    val processes = varchar("processes", 1000).nullable()
    val externalTreatments = varchar("externalTreatments", 50).nullable()
    val startDate = long("startDate").nullable()
    val endDate = long("endDate").nullable()
    val expectedEndDate = long("expectedEndDate").nullable()
    val orderPrincipal = reference("orderPrincipal", OrdersTable.id)
    val priority = integer("priority").nullable()

}

object ProcessesTable : IntIdTable("processes", columnName = "id") {
    val process = varchar("process", 50).uniqueIndex()

}
