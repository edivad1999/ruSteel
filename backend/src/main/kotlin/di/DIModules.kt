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
import routes.auth.Base64Encoder
import routes.auth.JavaBase64Encoder


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
            bind<Database>("database") with singleton {
                Database.connect( "jdbc:postgresql://localhost:5438", driver = "org.postgresql.Driver",user = "postgres",password = "postgres")
            }


        }


}
