import { useState, useCallback, useEffect } from "react";
import { usePrivateAxios } from "../hooks/usePrivateAxios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { Message } from "./Chat"


type ChatWindowProps = {
    username: string;
}

type FileUrls = {
    name: string;
    url: string;
}


export default function ChatWindow({ username }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [input, setInput] = useState<string | null>(null)
    const [fileBoxId, setFileBoxId] = useState<number | null>(null)
    const [fileUrls, setFileUrls] = useState<FileUrls[]>([])

    const privateAxios = usePrivateAxios()

    const navigator = useNavigate()

    const pullMessages = useCallback(async () => {
        try {
            const response = await privateAxios.get(`/me/${username}`);
            if (response.status === 200) {
                setMessages(response.data)
            }
        } catch (err: unknown) {
            console.error(err)
        }
    }, [privateAxios, username])

    function handleEdit(index: number, text: string) {
        setEditingIndex(index)
        setInput(text)
    }

    function handleCancelEdit() {
        setEditingIndex(null)
    }

    function handleSubmit(
        e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLInputElement>
    ) {
        e.preventDefault();

        if (!input?.trim()) return;
        if (!editingIndex) return;

        const id = messages[editingIndex].id

        privateAxios
            .patch(`/me/${username}`, { id, text: input })
            .then(() => pullMessages())
            .catch((err) => console.error(err))
            .finally(() => {
                setInput("");
                setEditingIndex(null);
                navigator(`/me/${username}`)
            })
    }

    function handleDelete(e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLInputElement>) {
        e.preventDefault();

        const id = e.currentTarget.dataset.id

        privateAxios
            .delete(`/me/${username}`, { data: { id } })
            .then(() => pullMessages())
            .catch((err) => console.error(err))
            .finally(() => {
                setInput("");
                setEditingIndex(null);
                navigator(`/me/${username}`)
            })
    }

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

    useEffect(() => {
        if (!username) return

        pullMessages()

        const interval = setInterval(() => {
            pullMessages()
        }, 5000);

        return () => clearInterval(interval);
    }, [username, pullMessages]);


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

                                    <div className="flex gap-1 w-auto">
                                        {message.sender.user_name !== username &&
                                            <>
                                                <MiniButton text="edit" handler={() => handleEdit(index, message.text)} />
                                                <MiniButton text="del" handler={handleDelete} messageId={message.id} />
                                            </>
                                        }
                                        <MiniButton
                                            isDisabled={message.links.length == 0}
                                            handler={() => toggleFilesBox(message.links, message.id)}
                                            text="files"
                                        />
                                    </div>
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
                                    value={input as string}
                                    type="text"
                                    className="bg-black h-full grow"
                                />
                                <MiniButton isDisabled={input?.length === 0} text="ok" handler={handleSubmit} messageId={message.id} />
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

function MiniButton({
    text,
    handler,
    isDisabled,
    messageId
}: {
    text: string,
    handler: (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLInputElement>) => void,
    isDisabled?: boolean,
    messageId?: number
}) {
    return (
        <input
            data-id={messageId}
            type="button"
            disabled={isDisabled}
            onClick={handler}
            value={text}
            className={`p-1 border border-red-400 hover:border-transparent bg-black hover:bg-red-400 text-red-400 hover:text-black rounded-md  disabled:border-gray-500 disabled:text-gray-500 disabled:hover:border-gray-500 disabled:hover:bg-black disabled:cursor-not-allowed`}
        />
    )
}