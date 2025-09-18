import axios from "../api/axios";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePrivateAxios } from "../hooks/usePrivateAxios";

type User = {
    email: string;
    id: number;
    user_name: string;
}

type SearchFormValues = { username: string }

export default function Panel() {
    const [results, setResults] = useState<User[] | null>(null)
    const [prevChats, setPrevChats] = useState<User[]>([])
    const privateAxios = usePrivateAxios()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SearchFormValues>();

    async function onSubmit(data: SearchFormValues) {
        try {
            const response = await axios.post("/search", { username: data.username });
            if (response.status === 200) {
                setResults(response.data)
            }
        } catch (err: unknown) {
            console.error(err)
        }
    }

    useEffect(() => {
        async function getMe() {
            try {
                const response = await privateAxios.get("/me");
                if (response.status === 200) {
                    setPrevChats(response.data)
                }
            } catch (err: unknown) {
                console.error(err)
            }
        }
        getMe()
    }, [privateAxios])

    return (
        <aside
            className="hidden big:flex flex-col p-4 gap-4 w-1/5 border border-transparent border-r-white">
            {/* search and results */}
            <div className="flex flex-col gap-2 border border-transparent border-b-white">
                <form onSubmit={handleSubmit(onSubmit)} className="h-11">
                    <input
                        type="text"
                        title="Search for username"
                        placeholder="🔎 username"
                        className="m-auto px-2 size-full border bg-black rounded-md rounded-b-none cursor-text"
                        {...register("username", {
                            required: "Username is required",
                        })}
                    />
                    {errors.username && (
                        <p className="text-sm text-red-600">{errors.username.message}</p>
                    )}
                    <button
                        type="submit"
                    >
                    </button>
                </form>
                {results === null
                    ? null
                    : results.length > 0
                        ? results.map((item, index) => (
                            <Link
                                to={`/me/${item.user_name}`}
                                key={"search-" + index}
                                className="bg-black odd:bg-gray-900 border rounded-md border-gray-600 cursor-pointer hover:border-white"
                            >
                                {item.user_name}
                            </Link>
                        ))
                        : <p className="px-2">Nothing</p>

                }
            </div>
            {/* prev chats */}
            <div className="flex flex-col gap-1">
                {prevChats.map((item, index) => (
                    <Link
                        to={`/me/${item.user_name}`}
                        key={"prev-" + index}
                        className="px-1 bg-black odd:bg-gray-900 rounded-md rounded-b-none border border-transparent border-b-white cursor-pointer hover:border-white"
                    >
                        {item.user_name}
                    </Link>
                ))}
            </div>
        </aside>
    )
}
