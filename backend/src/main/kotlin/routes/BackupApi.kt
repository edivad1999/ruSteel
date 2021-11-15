package routes

import instance
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.datetime.Clock
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import model.dao.InternalOrder
import model.dao.Order
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import routes.auth.Role
import java.io.FileReader


fun Route.backupApi() = route("backup") {
    val db: Database by instance()

    authenticate(Role.USER) {
        post("restore") {
            val multipart = call.receiveMultipart()
            val fileTmp = kotlin.runCatching {
                kotlin.io.path.createTempFile("backupRuSteel" + Clock.System.now().epochSeconds.toString(), ".json")
                    .toFile()
            }.getOrThrow()
            multipart.forEachPart { part ->
                // if part is a file (could be form item)
                if (part is PartData.FileItem) {
                    // retrieve file name of upload
                    // use InputStream from part to save file
                    part.streamProvider().use { its ->
                        // copy the stream to the file with buffering
                        fileTmp.outputStream().buffered().use {
                            // note that this is blocking
                            its.copyTo(it)
                        }
                    }
                }
                // make sure to dispose of the part after use to prevent leaks
                part.dispose()
                val jsonData = Json.decodeFromString<List<SerializableOrder>>(FileReader(fileTmp).readText())
                transaction(db) {
                    InternalOrder.all().forEach { it.delete() }
                    Order.all().forEach { it.delete() }

                    jsonData.forEach { request ->
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
                    }
                }
                call.respond(HttpStatusCode.OK)
            }
        }
    }
}
