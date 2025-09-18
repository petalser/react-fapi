import { lazy, Suspense } from "react"
// import Chat from "./Chat"
// import Panel from "./Panel"

const Chat = lazy(() => import("./Chat"))
const Panel = lazy(() => import("./Panel"))

export default function Home() {
    return (
        <Suspense>
            <div className="flex flex-row rounded-md bg-gray-800 h-[70dvh] w-3/5">
                <Panel />
                <Chat className="w-full big:w-4/5" />
            </div>
        </Suspense>
    )
}


