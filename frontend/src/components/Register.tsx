import axios from "../api/axios"
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { AxiosError } from "axios";

type FormValues = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function Register() {
    const [message, setMessage] = useState("")

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>();

    async function onSubmit(data: FormValues) {
        try {
            const response = await axios.post("/register", {
                user_name: data.username,
                email: data.email,
                password: data.password
            });
            if (response.status == 200) { //string or number
                setMessage("Successfully registered!")
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ detail?: string }>;
            setMessage("Registration failed: " + (error.response?.data?.detail || "unknown error"));
        }
    };

    const password = watch("password");

    return (
        <div className="big:border rounded-md flex flex-col gap-4 w-full big:w-1/3 p-7 m-auto">
            <h1>
                welcome to
                <br />
                <span className="uppercase text-4xl font-black">
                    gigachat
                </span>
                <br />
                registration page!
            </h1>
            {message.length > 0 ? (
                <p className="p-4 text-xl border-4 border-transparent border-l-white">{message}</p>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <label className="block border-b-1">
                        <input
                            type="text"
                            placeholder="Username"
                            className="m-auto px-2 w-full h-11 cursor-text"
                            {...register("username", { required: "Username is required" })}
                        />
                        {errors.username && (
                            <p className="text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </label>

                    <label className="block border-b-1">
                        <input
                            type="email"
                            placeholder="Email"
                            className="m-auto px-2 w-full h-11 cursor-text"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email address",
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </label>

                    <label className="block border-b-1">
                        <input
                            type="password"
                            placeholder="Password"
                            className="m-auto px-2 w-full h-11 cursor-text"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "At least 6 characters" },
                            })}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </label>

                    <label className="block border-b-1">
                        <input
                            type="password"
                            placeholder="Confirm password"
                            className="m-auto px-2 w-full h-11 cursor-text"
                            {...register("confirmPassword", {
                                required: "Please confirm password",
                                validate: (value) =>
                                    value === password || "Passwords do not match",
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </label>

                    <button
                        type="submit"
                        className="border border-red-700 hover:border-white bg-red-700 hover:bg-red-900 rounded-md m-auto px-2 h-11 w-full cursor-pointer"
                    >
                        Register
                    </button>
                </form>)}

            <Link to="/" className="border flex items-center justify-center border-red-700 hover:border-white bg-red-700 big:hover:bg-red-900 rounded-md h-11 w-full cursor-pointer">
                Back to main
            </Link>
        </div >)
}