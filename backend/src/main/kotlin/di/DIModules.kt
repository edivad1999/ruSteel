package di

import di.serializers.DayOfWeekSerializer
import di.serializers.InstantSerializer
import di.serializers.LocalTimeSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.contextual
import org.kodein.di.DI
import org.kodein.di.bind
import org.kodein.di.instance
import org.kodein.di.singleton


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


        }
    val database
        get() = DI.Module("database") {
//            bind<Database>("dbName") with singleton {
//                Database.connect( )
//            }


        }


}
