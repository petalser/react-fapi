import axios from "../api/axios";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { AxiosError } from "axios";

type LoginFormValues = {
    username: string;
    password: string;
};

export default function Lobby() {
    const [message, setMessage] = useState("");
    const { updateToken, updateMe, updateId } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>();

    async function onSubmit(data: LoginFormValues) {
        try {
            const params = new URLSearchParams();
            params.append("username", data.username);
            params.append("password", data.password);

            const response = await axios.post("/token", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            if (response.status === 200) {
                setMessage("Successfully logged in!");
                updateToken(response.data.access_token)
                updateMe(response.data.username)
                updateId(response.data.ID)
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ detail?: string }>;
            setMessage(
                "Login failed: " + (error.response?.data?.detail || "unknown error")
            );
        }
    }

    return (
        <div className="big:border rounded-md flex flex-col gap-4 w-full big:w-1/3 p-7 m-auto">
            <h1>
                welcome to
                <br />
                <span className="uppercase text-4xl font-black">gigachat</span>
            </h1>
            <p>please, log in</p>

            {message.length > 0 ? (
                <p className="p-4 text-xl border-4 border-transparent border-l-white">
                    {message}
                </p>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <label className="block border-b-1">
                        <input
                            type="text"
                            placeholder="Enter your username"
                            className="m-auto px-2 w-full h-11 cursor-text"
                            {...register("username", {
                                required: "Username is required",
                            })}
                        />
                        {errors.username && (
                            <p className="text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </label>

                    <label className="block border-b-1">
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="m-auto px-2 w-full h-11 cursor-text"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "At least 6 characters",
                                },
                            })}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </label>

                    <button
                        type="submit"
                        className="border border-red-700 hover:border-white bg-red-700 hover:bg-red-900 rounded-md m-auto px-2 h-11 w-full cursor-pointer"
                    >
                        Log in
                    </button>
                </form>
            )}

            <p>need account?</p>
            <Link
                to="/register"
                className="border flex items-center justify-center border-red-700 hover:border-white bg-red-700 hover:bg-red-900 rounded-md h-11 w-full cursor-pointer"
            >
                Register
            </Link>
        </div>
    );
}
