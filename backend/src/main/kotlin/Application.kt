import io.ktor.server.cio.*
import io.ktor.server.engine.*

fun main(args: Array<String>): Unit {
    embeddedServer(CIO, port = 69420) {
        managerModule()
    }.start(wait = true)
}

