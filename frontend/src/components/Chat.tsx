import { useState, useId } from "react"

type ChatProps = {
    className?: string;
}

export default function Chat({ className }: ChatProps) {
    const [messages, setMessages] = useState<string[]>([])
    const id = useId()

    return (
        <div className={`flex flex-col gap-4 p-4 ${className}`}>
            <div className="flex flex-col p-4 w-full grow rounded-md big:border">
                {messages.length > 0
                    ? messages.map((message, index) => {
                        const destructured = message.split("|")
                        return <p key={`${id}${index}`} className="">
                            <span className="font-bold">{destructured[0]} | </span>
                            {destructured[1]}
                        </p>
                    })
                    : <div className="m-auto text-gray-500 text-3xl">No messages yet</div>
                }
            </div>
            <div className="w-full flex flex-col big:flex-row gap-4">
                <div className="flex border rounded-md h-11 grow bg-black">
                    <label className="grow">
                        <input
                            type="text"
                            placeholder="Enter your message"
                            className="m-auto px-2 w-full h-full cursor-text" />
                    </label>
                    <label
                        title="Attach file"
                        className="flex size-11 cursor-pointer">
                        <span className="m-auto text-2xl">
                            📎
                        </span>
                        <input type="file"
                            className="hidden" />
                    </label>
                </div>
                <button className="border  border-red-700 hover:border-white bg-red-700 big:hover:bg-red-900 rounded-md m-auto px-2 h-11 w-full big:w-auto cursor-pointer">Send message</button>
            </div>
        </div>
    )
}