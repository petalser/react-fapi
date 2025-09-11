import Chat from "./Chat"
import Panel from "./Panel"

export default function Home() {
    return (
        <>
            <Panel />
            <Chat className="w-full big:w-4/5" />
        </>
    )
}


