import di.DIModules
import di.DIModules.serialization
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.auth.jwt.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.routing.*
import io.ktor.serialization.*
import kotlinx.coroutines.launch
import model.dao.UserAuth
import model.tables.UserAuthTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.kodein.di.direct
import org.kodein.di.instance
import org.kodein.di.ktor.DIFeature
import org.kodein.di.ktor.di
import routes.auth.PasswordDigester
import routes.auth.Role


fun Application.managerModule() {

    install(DIFeature) {
        import(DIModules.database)
        import(DIModules.serialization)

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





    install(ContentNegotiation) {
        json(di().direct.instance())
    }


    routing {
        route("api") {

        }
    }

}

fun Application.initDb() = launch {
    val db: Database by instance("database")

    val digester: PasswordDigester by instance()

    SchemaUtils.createMissingTablesAndColumns(UserAuthTable)

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

fun Authentication.Configuration.jwt(
    role: Role,
    configure: JWTAuthenticationProvider.Configuration.() -> Unit,
) = jwt(role.name, configure)
