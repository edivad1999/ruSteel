import di.DIModules
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.auth.jwt.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.routing.*
import io.ktor.serialization.*
import kotlinx.coroutines.launch
import model.dao.Process
import model.dao.UserAuth
import model.tables.InternalOrdersTable
import model.tables.OrdersTable
import model.tables.ProcessesTable
import model.tables.UserAuthTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.kodein.di.direct
import org.kodein.di.instance
import org.kodein.di.ktor.DIFeature
import org.kodein.di.ktor.di
import routes.auth.*
import routes.autoCompletionApi
import routes.backupApi
import routes.orderApi
import routes.processesApi


fun Application.managerModule() {

    install(DIFeature) {
        import(DIModules.database)
        import(DIModules.serialization)
        import(DIModules.security)

    }
    initDb()


    install(CORS) {
        anyHost()
        HttpMethod.DefaultMethods.forEach {
            method(it)
        }
        allowNonSimpleContentTypes = true
        allowHeaders { true }
        exposedHeaders.add("Content-Disposition")
//        allowSameOrigin=true
    }

    install(Authentication) {
        val credentialVerifierJWT: JWTCredentialsVerifier by di().instance()
        Role.values().forEach { role ->
            jwt(role) {
                verifier(JwtConfig.verifier)
                realm = "ruSteel"
                validate {
                    credentialVerifierJWT.verify(it)
                }
            }
        }
    }



    install(ContentNegotiation) {
        json(di().direct.instance())
    }


    routing {
        route("api") {
            loginApi()
            verifierJWTApi()
            orderApi()
            processesApi()
            backupApi()
//            userAdminApi()
            autoCompletionApi()
        }
    }

}

fun Application.initDb() = launch {
    val db: Database by instance()
    val digester: PasswordDigester by instance()
    transaction(db) {
        SchemaUtils.createMissingTablesAndColumns(UserAuthTable)
        SchemaUtils.createMissingTablesAndColumns(OrdersTable)
        SchemaUtils.createMissingTablesAndColumns(InternalOrdersTable)
        SchemaUtils.createMissingTablesAndColumns(ProcessesTable)
        //init processes
        val baseProcesses = listOf<String>("Taglio",
            "Tornitura sgrosso",
            "Tornitura",
            "Foratura",
            "Fresatura",
            "Brocciatura",
            "Grani",
            "Foratura estrazione",
            "Saldatura",
            "Bilanciatura",
            "Montaggio",
            "Verniciatura",
            "Tornitura manuale",
            "Outsourcing",
            "Imballaggio")

        if (Process.count().toInt() == 0) {
            baseProcesses.forEach {
                Process.new {
                    process = it
                }
            }
        }

        val admin = UserAuth.find {
            UserAuthTable.username eq "admin"
        }
        if (admin.empty()) {
            UserAuth.new {
                username = "admin"
                hashPass = digester.digest("password")
            }
        }
    }
}

fun Authentication.Configuration.jwt(
    role: Role,
    configure: JWTAuthenticationProvider.Configuration.() -> Unit,
) = jwt(role.name, configure)
