import io.ktor.server.cio.*
import io.ktor.server.engine.*

fun main(args: Array<String>): Unit {
    embeddedServer(CIO, port = 42069) {
        managerModule()
    }.start(wait = true)
}

