package di

import di.serializers.DayOfWeekSerializer
import di.serializers.InstantSerializer
import di.serializers.LocalTimeSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.contextual
import org.jetbrains.exposed.sql.Database
import org.kodein.di.DI
import org.kodein.di.bind
import org.kodein.di.instance
import org.kodein.di.singleton
import routes.auth.*


object DIModules {

    val serialization
        get() = DI.Module("serialization") {
            bind<Json>() with singleton {
                Json(from = Json.Default) {
                    serializersModule = instance()
                    prettyPrint = true
                    prettyPrintIndent = "  "
                    encodeDefaults = true
                }
            }
            bind<SerializersModule>() with singleton {
                SerializersModule {
                    contextual(InstantSerializer)
                    contextual(LocalTimeSerializer)
                    contextual(DayOfWeekSerializer)
                }

            }

            bind<Base64Encoder>() with singleton { JavaBase64Encoder() }
        }
    val database
        get() = DI.Module("database") {
            bind<Database>() with singleton {
                Database.connect("jdbc:${System.getenv("DATABASE_URL")?:"postgresql://localhost:5438/postgres"}", driver = "org.postgresql.Driver",
                user = "postgres",password = "postgres")
            }



        }

    val security
        get() = DI.Module("security") {
            bind<JWTCredentialsVerifier>() with singleton {
                MyJWTCredentialVerifier(di)
            }

            bind<PasswordDigester>() with singleton { SHA256Digester() }

        }

}
