import ChatWindow from "./ChatWindow";
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react"
import { usePrivateAxios } from "../hooks/usePrivateAxios";
import { useForm } from "react-hook-form";

type ChatProps = {
    className?: string;
}

type SendMessageFormValues = {
    text: string;
    files?: File[]
}

type UserInfo = { user_name: string, email: string }

export type Message = {
    created_at: Date;
    id: number;
    links: string[];
    receiver: UserInfo;
    receiver_id: number;
    sender: UserInfo;
    sender_id: number;
    text: string;
}

export default function Chat({ className }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
        setValue
    } = useForm<SendMessageFormValues>({
        defaultValues: { text: "", files: [] },
        mode: "onChange"
    })
    const privateAxios = usePrivateAxios()
    const { username } = useParams();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
        setValue("files", files);
    };

    const fetchCallback = useCallback(async () => {
        try {
            const response = await privateAxios.get(`/me/${username}`);
            if (response.status === 200) {
                setMessages(response.data)
            }
        } catch (err: unknown) {
            console.error(err)
        }
    }, [privateAxios, username])

    useEffect(() => {
        if (!username) return

        fetchCallback()

        const interval = setInterval(() => {
            fetchCallback()
        }, 5000);

        return () => clearInterval(interval);
    }, [username, fetchCallback]);

    async function onSubmit(data: SendMessageFormValues) {
        const formData = new FormData();
        formData.append("text", data.text);

        if (data.files && data.files.length > 0) {
            data.files.forEach((f) => formData.append("files", f));
        }

        const response = await privateAxios.post(
            `/me/${username}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } })

        setMessages(prev => [...prev, response.data])
        reset()
        setSelectedFiles([])
    }

    if (!messages) {
        return <div>Loading chat...</div>;
    }

    return (
        <div className={`flex flex-col gap-4 p-4 ${className}`}>
            {/* <div className="overflow-x-scroll flex flex-col p-4 w-full grow rounded-md big:border">
                {messages.length > 0
                    ? messages.map((message, index) => {
                        return <div
                            key={`message-` + index}
                            className={`flex justify-between mb-1 border border-transparent ${message.sender.user_name === username ? "" : "border-l-white"}`}>
                            <p key={`messages-${index}`} className="px-2">
                                <span className="font-bold">
                                    {message.sender.user_name !== username
                                        ? "You"
                                        : message.sender.user_name} | </span>
                                {message.text}
                            </p>
                            {message.sender.user_name !== username && <div className="flex gap-1 w-auto">
                                <button className="p-1 border border-red-400 hover:border-transparent bg-black hover:bg-red-400 text-red-400 hover:text-black rounded-md cursor-pointer">edit</button>
                                <button className="p-1 border border-red-400 hover:border-transparent bg-black hover:bg-red-400 text-red-400 hover:text-black rounded-md cursor-pointer">del</button>
                                <button
                                    disabled={message.links.length == 0}
                                    className="p-1 border border-red-400 hover:border-transparent bg-black hover:bg-red-400 text-red-400 hover:text-black rounded-md cursor-pointer disabled:border-gray-500 disabled:text-gray-500">files</button>
                            </div>

                            }
                        </div>
                    })
                    : username
                        ? <div className="m-auto text-gray-500 text-3xl">No messages yet</div>
                        : <p className="m-auto">please, choose user</p>
                }
            </div> */}
            <ChatWindow messages={messages} username={username} />
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full flex flex-col big:flex-row gap-4"
            >
                <div className="flex border rounded-md h-11 grow bg-black">
                    <label className="grow">
                        <input
                            disabled={!username}
                            type="text"
                            {...register("text", { required: "Please, enter the text" })}
                            placeholder="Enter your message"
                            className="m-auto px-2 w-full h-full cursor-text"
                        />
                    </label>

                    <label
                        title={selectedFiles.length == 0
                            ? "Attach file(s)"
                            : selectedFiles.length == 1
                                ? "1 file picked"
                                : `${selectedFiles.length} files picked`
                        }
                        className={`flex size-11 ${username ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                        <span className="m-auto text-2xl"                        >
                            {selectedFiles.length || "📎"}
                        </span>
                        <input
                            type="file"
                            multiple
                            disabled={!username}

                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                </div>

                {errors.text && (
                    <p className="text-red-500 text-sm">{errors.text.message}</p>
                )}

                <input
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    value="Send message"
                    className="border border-red-700 hover:border-white bg-red-700 big:hover:bg-red-900 rounded-md m-auto px-2 h-11 w-full big:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </form>

        </div>
    )
}