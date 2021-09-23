package model.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import routes.auth.Role

object UserAuthTable : IntIdTable("users", "id") {
    val username = varchar("username", 50).uniqueIndex()
    val hashPass = varchar("password", 200)
    val role = varchar("role", 50).default(Role.USER.name)

}

object OrdersTable : IntIdTable("orders", columnName = "id") {
    val product = varchar("product", 50)
    val requestedDate = integer("requestedDate")
    val requestedQuantity = integer("requestedQuantity")
    val commission = varchar("commission", 50)
    val client = varchar("client", 50)
    val clientOrderCode = varchar("order", 50)
    val startDate = integer("startDate")
    val endDate = integer("endDate")
    val expectedEndDate = integer("expectedEndDate")
}

object InternalOrdersTable : IntIdTable("internal-orders", columnName = "id") {
    val productCode = varchar("productCode", 50)
    val productQuantity = integer("productQuantity")
    val rawCode = varchar("rawCode", 50)
    val rawQuantity = integer("rawQuantity")
    val operator = varchar("operator", 50)
    val processes = varchar("processes", 1000)
    val externalTreatments = varchar("externalTreatments", 50)
    val orderPrincipal = integer("orderPrincipal").references(OrdersTable.id)
}

object ProcessesTable : IntIdTable("processes", columnName = "id") {
    val process = varchar("process", 50).uniqueIndex()

}
