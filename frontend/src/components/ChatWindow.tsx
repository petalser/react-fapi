import { useState, Suspense, type FormEvent } from "react";
import { usePrivateAxios } from "../hooks/usePrivateAxios";
import { Link } from "react-router-dom";
import type { Message } from "./Chat"

type ChatWindowProps = {
    messages: Message[];
    username: string;
}

type FileUrls = {
    name: string;
    url: string;
}


export default function ChatWindow({ messages, username }: ChatWindowProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [input, setInput] = useState<string | null>(null)
    const [fileBoxId, setFileBoxId] = useState<number | null>(null)
    const [fileUrls, setFileUrls] = useState<FileUrls[]>([])

    const privateAxios = usePrivateAxios()

    function handleEdit(index: number, text: string) {
        setEditingIndex(index)
        setInput(text)
    }

    function handleCancelEdit() {
        setEditingIndex(null)
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
    }

    function handleDelete(id: number) { }

    async function toggleFilesBox(links: string[], id: number) {
        setFileBoxId(prev => prev === id ? null : id)

        const promises = links.map(async (link) => {
            try {
                const response = await privateAxios.get(`/download/${link}`)
                const name = link.slice(link.indexOf(".") + 1) //strip uuid
                return { name, url: response.data.download_url }
            } catch (err) {
                console.error(err, "CUSTOM")
                return { name: link, url: "NA" }
            }
        })

        const urls = await Promise.all(promises)

        setFileUrls(urls)
    }

    return (
        <div className="overflow-x-scroll flex flex-col p-4 w-full grow rounded-md big:border">
            {messages.length > 0
                ? messages.map((message, index) => {
                    return <div
                        key={`message-` + index}
                        className={`flex flex-col mb-1 border border-transparent ${message.sender.user_name === username ? "" : "border-l-white"}`}>

                        {editingIndex !== index
                            ? <>
                                <div className="flex justify-between border w-full">
                                    <DefaultMessage
                                        isMe={message.sender.user_name !== username}
                                        index={index}
                                        message={message}
                                    />
                                    {message.sender.user_name !== username &&
                                        <div className="flex gap-1 w-auto">
                                            <MiniButton text="edit" handler={() => handleEdit(index, message.text)} />
                                            <MiniButton text="del" handler={() => handleDelete(message.id)} />
                                            <MiniButton
                                                isDisabled={message.links.length == 0}
                                                handler={() => toggleFilesBox(message.links, message.id)}
                                                text="files"
                                            />
                                        </div>}
                                </div>
                                {message.id === fileBoxId
                                    && message.links.length > 0
                                    && <ul className="flex flex-col">
                                        {message.links.map((_, i) => {
                                            const file = fileUrls[i]
                                            return (
                                                <li key={`filelink-${i}`} className="border">
                                                    {file
                                                        ? <Link
                                                            to={file.url}
                                                            className="p-1 border border-red-400 hover:border-transparent bg-black hover:bg-red-400 text-red-400 hover:text-black rounded-md cursor-pointer disabled:border-gray-500 disabled:text-gray-500 flex justify-between"
                                                        >
                                                            {file.name}
                                                            {file.url === "NA" &&
                                                                <span className="bg-white/30 rounded-md">
                                                                    Broken link
                                                                </span>
                                                            }
                                                        </Link>
                                                        : <span>Loading...</span>}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                }
                            </>
                            : <form
                                onSubmit={handleSubmit}
                                className="flex w-full"
                            >
                                <input
                                    onChange={(e) => setInput(e.target.value)}
                                    value={input}
                                    type="text"
                                    className="bg-black h-full grow"
                                />
                                <MiniButton isDisabled={input?.length === 0} text="ok" handler={handleSubmit} />
                                <MiniButton text="cancel" handler={handleCancelEdit} />
                            </form>
                        }


                    </div>
                })
                : username
                    ? <div className="m-auto text-gray-500 text-3xl">No messages yet</div>
                    : <p className="m-auto">please, choose user</p>
            }
        </div>
    )
}

function DefaultMessage({ message, index, isMe }: { message: Message, index: number, isMe: boolean }) {
    return (
        <p key={`messages-${index}`} className="px-2">
            <span className="font-bold">
                {isMe
                    ? "You"
                    : message.sender.user_name} | </span>
            {message.text}
        </p>
    )
}

function MiniButton({ text, handler, isDisabled }: { text: string, handler: () => void, isDisabled?: boolean }) {
    return (
        <button
            disabled={isDisabled}
            onClick={handler}
            className={`p-1 border border-red-400 hover:border-transparent bg-black hover:bg-red-400 text-red-400 hover:text-black rounded-md cursor-pointer disabled:border-gray-500 disabled:text-gray-500`}>{text}</button>
    )
}